import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useAuth, api } from '@/context/AuthContext';

interface Img {
  id: number; prompt: string; style: string; provider: string; size: string;
  image_url: string; status: string; is_public: boolean; likes: number; created_at: string;
}

const statusBadge = (s: string) =>
  s === 'done' ? 'border-accent/40 text-accent' :
  s === 'processing' || s === 'queued' ? 'border-primary/40 text-primary' :
  'border-destructive/40 text-destructive';
const statusLabel = (s: string) => ({ done: 'Готово', processing: 'Обработка', queued: 'В очереди', error: 'Ошибка' }[s] || s);

const History = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [images, setImages] = useState<Img[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('grid');
  const [preview, setPreview] = useState<Img | null>(null);

  const load = () => {
    if (!user) { setLoading(false); return; }
    api.history().then((d) => setImages(d.images || [])).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(load, [user]);

  const togglePublic = async (img: Img) => {
    try {
      await api.setImagePublic(img.id, !img.is_public);
      setImages((arr) => arr.map((i) => i.id === img.id ? { ...i, is_public: !i.is_public } : i));
    } catch { /* ignore */ }
  };

  const remove = async (id: number) => {
    try {
      await api.deleteImage(id);
      setImages((arr) => arr.filter((i) => i.id !== id));
      toast({ title: 'Удалено' });
    } catch { /* ignore */ }
  };

  if (!user) {
    return (
      <div className="container py-20 text-center">
        <Icon name="Lock" size={48} className="mx-auto mb-4 text-muted-foreground opacity-50" />
        <h2 className="font-display font-bold text-2xl mb-2">Требуется вход</h2>
        <p className="text-muted-foreground mb-6">Войдите, чтобы увидеть историю своих генераций</p>
        <Link to="/generator"><Button className="gradient-bg text-white border-0">Перейти к генератору</Button></Link>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-extrabold text-3xl mb-1">История генераций</h1>
          <p className="text-muted-foreground text-sm">Все ваши созданные изображения</p>
        </div>
        <Tabs value={view} onValueChange={setView}>
          <TabsList>
            <TabsTrigger value="grid"><Icon name="LayoutGrid" size={16} /></TabsTrigger>
            <TabsTrigger value="table"><Icon name="List" size={16} /></TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-3 gap-4">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="aspect-square rounded-2xl" />)}</div>
      ) : images.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Icon name="ImageOff" size={48} className="mx-auto mb-4 opacity-50" />
          <p className="mb-4">У вас пока нет генераций</p>
          <Link to="/generator"><Button className="gradient-bg text-white border-0">Создать первое изображение</Button></Link>
        </div>
      ) : view === 'grid' ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {images.map((img) => (
            <Card key={img.id} className="glass border-white/10 overflow-hidden group">
              <div className="relative aspect-square overflow-hidden cursor-pointer" onClick={() => img.image_url && setPreview(img)}>
                {img.image_url ? (
                  <img src={img.image_url} alt={img.prompt} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-secondary/40"><Icon name="ImageOff" size={32} className="text-muted-foreground" /></div>
                )}
                <Badge variant="outline" className={`absolute top-3 left-3 bg-card/80 ${statusBadge(img.status)}`}>{statusLabel(img.status)}</Badge>
              </div>
              <CardContent className="p-4 space-y-3">
                <p className="font-medium text-sm line-clamp-1">{img.prompt}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{img.provider}</span>·<span>{img.size}</span>·<span className="flex items-center gap-1"><Icon name="Heart" size={11} /> {img.likes}</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <Switch checked={img.is_public} onCheckedChange={() => togglePublic(img)} />
                    <span className="text-xs text-muted-foreground">{img.is_public ? 'Публично' : 'Приватно'}</span>
                  </div>
                  <div className="flex gap-1">
                    {img.image_url && (
                      <Button size="icon" variant="ghost" className="h-8 w-8" asChild>
                        <a href={img.image_url} download target="_blank" rel="noreferrer"><Icon name="Download" size={15} /></a>
                      </Button>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive"><Icon name="Trash2" size={15} /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="glass border-white/10">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Удалить изображение?</AlertDialogTitle>
                          <AlertDialogDescription>Это действие необратимо.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Отмена</AlertDialogCancel>
                          <AlertDialogAction onClick={() => remove(img.id)} className="bg-destructive">Удалить</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="glass border-white/10">
          <CardContent className="p-2 sm:p-4">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead>Превью</TableHead><TableHead>Промпт</TableHead>
                  <TableHead className="hidden sm:table-cell">Провайдер</TableHead>
                  <TableHead className="hidden md:table-cell">Размер</TableHead>
                  <TableHead>Статус</TableHead><TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {images.map((img) => (
                  <TableRow key={img.id} className="border-border">
                    <TableCell>
                      {img.image_url ? <img src={img.image_url} className="w-12 h-12 rounded-lg object-cover cursor-pointer" onClick={() => setPreview(img)} alt="" /> : <div className="w-12 h-12 rounded-lg bg-secondary/40" />}
                    </TableCell>
                    <TableCell className="font-medium max-w-[200px] truncate">{img.prompt}</TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">{img.provider}</TableCell>
                    <TableCell className="hidden md:table-cell font-mono text-xs text-muted-foreground">{img.size}</TableCell>
                    <TableCell><Badge variant="outline" className={statusBadge(img.status)}>{statusLabel(img.status)}</Badge></TableCell>
                    <TableCell className="text-right">
                      {img.image_url && <Button size="icon" variant="ghost" className="h-8 w-8" asChild><a href={img.image_url} download target="_blank" rel="noreferrer"><Icon name="Download" size={15} /></a></Button>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={!!preview} onOpenChange={() => setPreview(null)}>
        <DialogContent className="glass max-w-2xl border-white/10">
          <DialogHeader><DialogTitle className="font-display">{preview?.prompt}</DialogTitle></DialogHeader>
          {preview?.image_url && (
            <div className="space-y-4">
              <img src={preview.image_url} alt={preview.prompt} className="w-full rounded-xl" />
              <Button className="w-full gradient-bg text-white border-0" asChild>
                <a href={preview.image_url} download target="_blank" rel="noreferrer"><Icon name="Download" size={18} className="mr-2" /> Скачать</a>
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default History;
