import { useEffect, useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth, api } from '@/context/AuthContext';

interface Img {
  id: number; prompt: string; style: string; provider: string; size: string;
  image_url: string; likes: number; author: string; liked: boolean;
}

const STYLE_FILTERS = ['Все', 'Кибербанк', 'Аниме', 'Реализм', 'Фэнтези', '3D рендер', 'Масло'];

const Gallery = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [images, setImages] = useState<Img[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Все');
  const [search, setSearch] = useState('');
  const [preview, setPreview] = useState<Img | null>(null);

  const load = () => {
    api.gallery().then((d) => setImages(d.images || [])).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const toggleLike = async (img: Img, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) { toast({ title: 'Войдите, чтобы ставить лайки', variant: 'destructive' }); return; }
    try {
      const res = await api.like(img.id);
      setImages((arr) => arr.map((i) => i.id === img.id ? { ...i, liked: res.liked, likes: res.likes } : i));
    } catch { /* ignore */ }
  };

  const filtered = images.filter((i) =>
    (filter === 'Все' || i.style === filter) &&
    (!search || i.prompt.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="container py-10">
      <h1 className="font-display font-extrabold text-3xl mb-1">Галерея работ</h1>
      <p className="text-muted-foreground text-sm mb-6">Лучшие изображения сообщества NeuroArt</p>

      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Поиск по описанию..." className="pl-10 bg-input/60" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {STYLE_FILTERS.map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === s ? 'gradient-bg text-white' : 'bg-secondary/50 text-muted-foreground hover:text-foreground'
              }`}>{s}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="aspect-square rounded-2xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Icon name="ImageOff" size={48} className="mx-auto mb-4 opacity-50" />
          <p>Пока нет работ. Станьте первым — создайте изображение!</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((g, i) => (
            <Card key={g.id} className="glass border-white/10 overflow-hidden group glow-hover cursor-pointer animate-scale-in"
              style={{ animationDelay: `${i * 0.03}s` }} onClick={() => setPreview(g)}>
              <div className="relative aspect-square overflow-hidden">
                <img src={g.image_url} alt={g.prompt} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />
                <Badge className="absolute top-3 left-3 gradient-bg text-white border-0 text-xs">{g.style}</Badge>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="font-semibold text-sm mb-2 line-clamp-1">{g.prompt}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/70 flex items-center gap-1.5"><Icon name="User" size={12} /> {g.author}</span>
                    <button onClick={(e) => toggleLike(g, e)} className="text-xs text-white/70 flex items-center gap-1 hover-scale">
                      <Icon name="Heart" size={14} className={g.liked ? 'text-primary fill-primary' : 'text-white/70'} /> {g.likes}
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!preview} onOpenChange={() => setPreview(null)}>
        <DialogContent className="glass max-w-2xl border-white/10">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <Icon name="Image" size={20} className="text-primary" /> {preview?.prompt}
            </DialogTitle>
          </DialogHeader>
          {preview && (
            <div className="space-y-4">
              <img src={preview.image_url} alt={preview.prompt} className="w-full rounded-xl" />
              <div className="flex flex-wrap gap-2 text-sm">
                <Badge variant="outline" className="border-border">{preview.style}</Badge>
                <Badge variant="outline" className="border-border">{preview.provider}</Badge>
                <Badge variant="outline" className="border-border">{preview.size}</Badge>
                <Badge variant="outline" className="border-border gap-1"><Icon name="Heart" size={12} /> {preview.likes}</Badge>
              </div>
              <Button className="w-full gradient-bg text-white border-0 glow-hover" asChild>
                <a href={preview.image_url} download target="_blank" rel="noreferrer">
                  <Icon name="Download" size={18} className="mr-2" /> Скачать изображение
                </a>
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Gallery;
