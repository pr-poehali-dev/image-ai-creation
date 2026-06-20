import { useEffect, useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth, api } from '@/context/AuthContext';
import AuthDialog from '@/components/AuthDialog';

const STYLES = [
  { name: 'Кибербанк', icon: 'Cpu' },
  { name: 'Аниме', icon: 'Sparkles' },
  { name: 'Реализм', icon: 'Camera' },
  { name: 'Фэнтези', icon: 'Wand2' },
  { name: '3D рендер', icon: 'Box' },
  { name: 'Масло', icon: 'Palette' },
];
const SIZES = ['512×512', '768×768', '1024×1024', '1024×1792'];

interface Prov { slug: string; name: string; credit_cost: number; }

const Generator = () => {
  const { user, setUser } = useAuth();
  const { toast } = useToast();
  const [authOpen, setAuthOpen] = useState(false);
  const [providers, setProviders] = useState<Prov[]>([]);
  const [prompt, setPrompt] = useState('');
  const [activeStyle, setActiveStyle] = useState('Кибербанк');
  const [provider, setProvider] = useState('caila');
  const [size, setSize] = useState('1024×1024');
  const [steps, setSteps] = useState([30]);
  const [isPublic, setIsPublic] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [queue, setQueue] = useState<{ prompt: string; url: string }[]>([]);

  useEffect(() => {
    api.providers().then((d) => {
      setProviders(d.providers || []);
      if (d.providers?.[0]) setProvider(d.providers[0].slug);
    }).catch(() => {});
  }, []);

  const handleGenerate = async () => {
    if (!user) { setAuthOpen(true); return; }
    if (!prompt.trim()) { toast({ title: 'Введите описание', variant: 'destructive' }); return; }
    setGenerating(true);
    setResult(null);
    try {
      const res = await api.generate({ prompt, style: activeStyle, provider, size, steps: steps[0], is_public: isPublic });
      setResult(res.image_url);
      setQueue((q) => [{ prompt, url: res.image_url }, ...q].slice(0, 6));
      if (user) setUser({ ...user, credits: res.credits });
      toast({ title: 'Готово!', description: 'Изображение успешно создано' });
    } catch (e) {
      toast({ title: 'Ошибка', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setGenerating(false);
    }
  };

  const cost = providers.find((p) => p.slug === provider)?.credit_cost ?? 1;

  return (
    <div className="container py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-extrabold text-3xl mb-1">Генератор</h1>
          <p className="text-muted-foreground text-sm">Опиши идею и выбери параметры</p>
        </div>
        {user && (
          <Badge variant="outline" className="border-accent/40 text-accent gap-1 h-9 px-4">
            <Icon name="Zap" size={14} /> {user.credits} кредитов
          </Badge>
        )}
      </div>

      <div className="grid lg:grid-cols-[1fr_1.1fr] gap-6">
        <Card className="glass border-white/10">
          <CardContent className="p-6 space-y-6">
            <div>
              <Label className="text-sm font-semibold mb-2 block">Описание изображения</Label>
              <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)}
                placeholder="Космонавт верхом на единороге, неоновые краски, киберпанк..."
                className="min-h-28 bg-input/60 border-border resize-none text-base" />
            </div>

            <div>
              <Label className="text-sm font-semibold mb-3 block">Стиль</Label>
              <div className="grid grid-cols-3 gap-2">
                {STYLES.map((s) => (
                  <button key={s.name} onClick={() => setActiveStyle(s.name)}
                    className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border text-xs font-medium transition-all ${
                      activeStyle === s.name ? 'gradient-bg text-white border-transparent glow' : 'bg-secondary/50 border-border text-muted-foreground hover:text-foreground'
                    }`}>
                    <Icon name={s.icon} size={18} />
                    {s.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-semibold mb-2 block">Провайдер ИИ</Label>
                <Select value={provider} onValueChange={setProvider}>
                  <SelectTrigger className="bg-input/60 border-border"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {providers.map((p) => (
                      <SelectItem key={p.slug} value={p.slug}>{p.name} · {p.credit_cost}🪙</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-semibold mb-2 block">Размер</Label>
                <Select value={size} onValueChange={setSize}>
                  <SelectTrigger className="bg-input/60 border-border"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SIZES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <Label className="text-sm font-semibold">Качество (шаги)</Label>
                <span className="text-sm text-accent font-mono">{steps[0]}</span>
              </div>
              <Slider value={steps} onValueChange={setSteps} min={10} max={60} step={5} />
            </div>

            <div className="flex items-center justify-between rounded-xl bg-secondary/40 px-4 py-3">
              <div>
                <Label className="text-sm font-semibold">Публичная галерея</Label>
                <p className="text-xs text-muted-foreground">Показывать работу другим пользователям</p>
              </div>
              <Switch checked={isPublic} onCheckedChange={setIsPublic} />
            </div>

            <Button onClick={handleGenerate} disabled={generating}
              className="w-full h-12 gradient-bg text-white border-0 text-base font-semibold glow-hover">
              {generating ? (
                <><Icon name="Loader2" size={18} className="mr-2 animate-spin" /> Генерация...</>
              ) : (
                <><Icon name="Sparkles" size={18} className="mr-2" /> Сгенерировать · {cost}🪙</>
              )}
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="glass border-white/10 overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-lg">Результат</h3>
                <Badge variant="outline" className="border-border text-muted-foreground gap-1">
                  <Icon name="Cpu" size={12} /> {providers.find((p) => p.slug === provider)?.name || provider}
                </Badge>
              </div>
              <div className="rounded-2xl border border-dashed border-border bg-secondary/30 flex items-center justify-center min-h-[420px] relative overflow-hidden">
                {generating && (
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center mx-auto mb-4 animate-float glow">
                      <Icon name="Sparkles" size={28} className="text-white" />
                    </div>
                    <p className="text-muted-foreground text-sm">Нейросеть рисует вашу идею...</p>
                  </div>
                )}
                {!generating && result && (
                  <div className="absolute inset-0 group animate-scale-in">
                    <img src={result} alt="Результат" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center gap-3 pb-6">
                      <Button size="sm" className="gradient-bg text-white border-0" onClick={() => setPreview(result)}>
                        <Icon name="Eye" size={16} className="mr-1.5" /> Просмотр
                      </Button>
                      <Button size="sm" variant="secondary" asChild>
                        <a href={result} download target="_blank" rel="noreferrer">
                          <Icon name="Download" size={16} className="mr-1.5" /> Скачать
                        </a>
                      </Button>
                    </div>
                  </div>
                )}
                {!generating && !result && (
                  <div className="text-center text-muted-foreground">
                    <Icon name="ImagePlus" size={40} className="mx-auto mb-3 opacity-50" />
                    <p className="text-sm">Здесь появится ваше изображение</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {queue.length > 0 && (
            <Card className="glass border-white/10">
              <CardContent className="p-4">
                <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <Icon name="Layers" size={16} className="text-accent" /> Очередь генераций
                </h3>
                <div className="grid grid-cols-6 gap-2">
                  {queue.map((q, i) => (
                    <button key={i} onClick={() => setPreview(q.url)} className="aspect-square rounded-lg overflow-hidden hover-scale">
                      <img src={q.url} alt={q.prompt} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Dialog open={!!preview} onOpenChange={() => setPreview(null)}>
        <DialogContent className="glass max-w-2xl border-white/10">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <Icon name="Image" size={20} className="text-primary" /> Просмотр изображения
            </DialogTitle>
          </DialogHeader>
          {preview && (
            <div className="space-y-4">
              <img src={preview} alt="Просмотр" className="w-full rounded-xl" />
              <Button className="w-full gradient-bg text-white border-0 glow-hover" asChild>
                <a href={preview} download target="_blank" rel="noreferrer">
                  <Icon name="Download" size={18} className="mr-2" /> Скачать в высоком качестве
                </a>
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
    </div>
  );
};

export default Generator;
