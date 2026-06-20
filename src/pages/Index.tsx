import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const IMAGES = [
  'https://cdn.poehali.dev/projects/dd615ddf-a524-4830-84be-0efad817b5c2/files/4597ed27-856f-458b-83da-002ff89939f7.jpg',
  'https://cdn.poehali.dev/projects/dd615ddf-a524-4830-84be-0efad817b5c2/files/04a73cce-6e88-44a1-bcf9-138279db87d6.jpg',
  'https://cdn.poehali.dev/projects/dd615ddf-a524-4830-84be-0efad817b5c2/files/d1d1eb7f-4446-4758-9f65-44f48c1c1a25.jpg',
];

const NAV = ['Главная', 'Генератор', 'Галерея', 'История', 'Тарифы'];

const STYLES = [
  { name: 'Кибербанк', icon: 'Cpu' },
  { name: 'Аниме', icon: 'Sparkles' },
  { name: 'Реализм', icon: 'Camera' },
  { name: 'Фэнтези', icon: 'Wand2' },
  { name: '3D рендер', icon: 'Box' },
  { name: 'Масло', icon: 'Palette' },
];

const PROVIDERS = ['Caila', 'Chutes', 'Cerebras', 'OpenAI'];
const SIZES = ['512×512', '768×768', '1024×1024', '1024×1792'];

const GALLERY = [
  { img: IMAGES[0], prompt: 'Неоновый кибер-портрет', style: 'Кибербанк', author: 'Анна К.', likes: 248 },
  { img: IMAGES[1], prompt: 'Парящий остров в закате', style: 'Фэнтези', author: 'Дмитрий В.', likes: 187 },
  { img: IMAGES[2], prompt: 'Жидкий хром, абстракция', style: '3D рендер', author: 'Мария С.', likes: 312 },
  { img: IMAGES[1], prompt: 'Сюрреалистичный пейзаж', style: 'Фэнтези', author: 'Игорь П.', likes: 94 },
  { img: IMAGES[2], prompt: 'Радужная скульптура', style: '3D рендер', author: 'Ольга Н.', likes: 156 },
  { img: IMAGES[0], prompt: 'Голографическая девушка', style: 'Кибербанк', author: 'Павел М.', likes: 203 },
];

const HISTORY = [
  { id: 'GEN-8842', prompt: 'Неоновый кибер-портрет', provider: 'Caila', size: '1024×1024', status: 'Готово', date: '20 июн, 14:32' },
  { id: 'GEN-8841', prompt: 'Парящий остров', provider: 'Chutes', size: '768×768', status: 'Готово', date: '20 июн, 14:18' },
  { id: 'GEN-8840', prompt: 'Жидкий хром', provider: 'Cerebras', size: '1024×1792', status: 'В очереди', date: '20 июн, 14:05' },
  { id: 'GEN-8839', prompt: 'Город будущего', provider: 'OpenAI', size: '512×512', status: 'Ошибка', date: '20 июн, 13:47' },
];

const Index = () => {
  const [prompt, setPrompt] = useState('');
  const [activeStyle, setActiveStyle] = useState('Кибербанк');
  const [provider, setProvider] = useState('Caila');
  const [size, setSize] = useState('1024×1024');
  const [steps, setSteps] = useState([30]);
  const [count, setCount] = useState([2]);
  const [generating, setGenerating] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const handleGenerate = () => {
    setGenerating(true);
    setResult(null);
    setTimeout(() => {
      setGenerating(false);
      setResult(IMAGES[Math.floor(Math.random() * IMAGES.length)]);
    }, 2200);
  };

  return (
    <div className="min-h-screen text-foreground">
      {/* NAV */}
      <header className="sticky top-0 z-40 glass">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center glow">
              <Icon name="Sparkles" size={20} className="text-white" />
            </div>
            <span className="font-display font-extrabold text-lg tracking-tight">NeuroArt</span>
          </div>
          <nav className="hidden md:flex items-center gap-1">
            {NAV.map((item, i) => (
              <button
                key={item}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  i === 1 ? 'text-foreground bg-secondary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {item}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="hidden sm:flex border-accent/40 text-accent gap-1">
              <Icon name="Zap" size={12} /> 48 кредитов
            </Badge>
            <Avatar className="w-9 h-9 border-2 border-primary/50">
              <AvatarFallback className="bg-secondary text-sm">ЮП</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="container pt-16 pb-10 text-center relative overflow-hidden">
        <div className="absolute -z-10 left-1/2 top-10 -translate-x-1/2 w-[420px] h-[420px] rounded-full gradient-bg blur-[120px] opacity-30 animate-float" />
        <Badge className="mb-6 gradient-bg text-white border-0 px-4 py-1.5 animate-scale-in">
          <Icon name="Stars" size={14} className="mr-1.5" /> 4 нейросети в одном месте
        </Badge>
        <h1 className="font-display font-black text-4xl md:text-6xl leading-tight mb-5 animate-fade-in">
          Создавай <span className="gradient-text">шедевры</span><br />силой искусственного интеллекта
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          Опиши идею словами — Caila, Chutes, Cerebras и OpenAI воплотят её в изображение за секунды.
        </p>
        <div className="flex items-center justify-center gap-3 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <Button size="lg" className="gradient-bg text-white border-0 glow-hover h-12 px-7 text-base font-semibold">
            <Icon name="Wand2" size={18} className="mr-2" /> Начать творить
          </Button>
          <Button size="lg" variant="outline" className="h-12 px-7 text-base border-border">
            Галерея работ
          </Button>
        </div>
      </section>

      {/* MAIN TABS */}
      <section className="container pb-24">
        <Tabs defaultValue="generator" className="w-full">
          <TabsList className="glass h-12 p-1 mb-8 mx-auto flex w-fit">
            <TabsTrigger value="generator" className="data-[state=active]:gradient-bg data-[state=active]:text-white px-5 gap-2">
              <Icon name="Wand2" size={16} /> Генератор
            </TabsTrigger>
            <TabsTrigger value="gallery" className="data-[state=active]:gradient-bg data-[state=active]:text-white px-5 gap-2">
              <Icon name="Images" size={16} /> Галерея
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:gradient-bg data-[state=active]:text-white px-5 gap-2">
              <Icon name="History" size={16} /> История
            </TabsTrigger>
          </TabsList>

          {/* GENERATOR */}
          <TabsContent value="generator" className="animate-fade-in">
            <div className="grid lg:grid-cols-[1fr_1.1fr] gap-6">
              {/* Controls */}
              <Card className="glass border-white/10">
                <CardContent className="p-6 space-y-6">
                  <div>
                    <Label className="text-sm font-semibold mb-2 block">Описание изображения</Label>
                    <Textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Космонавт верхом на единороге, неоновые краски, киберпанк..."
                      className="min-h-28 bg-input/60 border-border resize-none text-base"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-semibold mb-3 block">Стиль</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {STYLES.map((s) => (
                        <button
                          key={s.name}
                          onClick={() => setActiveStyle(s.name)}
                          className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border text-xs font-medium transition-all ${
                            activeStyle === s.name
                              ? 'gradient-bg text-white border-transparent glow'
                              : 'bg-secondary/50 border-border text-muted-foreground hover:text-foreground'
                          }`}
                        >
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
                        <SelectTrigger className="bg-input/60 border-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PROVIDERS.map((p) => (
                            <SelectItem key={p} value={p}>{p}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold mb-2 block">Размер</Label>
                      <Select value={size} onValueChange={setSize}>
                        <SelectTrigger className="bg-input/60 border-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SIZES.map((s) => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
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

                  <div>
                    <div className="flex justify-between mb-2">
                      <Label className="text-sm font-semibold">Количество вариантов</Label>
                      <span className="text-sm text-accent font-mono">{count[0]}</span>
                    </div>
                    <Slider value={count} onValueChange={setCount} min={1} max={4} step={1} />
                  </div>

                  <Button
                    onClick={handleGenerate}
                    disabled={generating}
                    className="w-full h-12 gradient-bg text-white border-0 text-base font-semibold glow-hover"
                  >
                    {generating ? (
                      <><Icon name="Loader2" size={18} className="mr-2 animate-spin" /> Генерация...</>
                    ) : (
                      <><Icon name="Sparkles" size={18} className="mr-2" /> Сгенерировать</>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Result */}
              <Card className="glass border-white/10 overflow-hidden">
                <CardContent className="p-6 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display font-bold text-lg">Результат</h3>
                    <Badge variant="outline" className="border-border text-muted-foreground gap-1">
                      <Icon name="Cpu" size={12} /> {provider}
                    </Badge>
                  </div>
                  <div className="flex-1 rounded-2xl border border-dashed border-border bg-secondary/30 flex items-center justify-center min-h-[420px] relative overflow-hidden">
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
                            <a href={result} download>
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
            </div>
          </TabsContent>

          {/* GALLERY */}
          <TabsContent value="gallery" className="animate-fade-in">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {GALLERY.map((g, i) => (
                <Card
                  key={i}
                  className="glass border-white/10 overflow-hidden group glow-hover cursor-pointer"
                  onClick={() => setPreview(g.img)}
                >
                  <div className="relative aspect-square overflow-hidden">
                    <img src={g.img} alt={g.prompt} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />
                    <Badge className="absolute top-3 left-3 gradient-bg text-white border-0 text-xs">{g.style}</Badge>
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <p className="font-semibold text-sm mb-2 line-clamp-1">{g.prompt}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/70 flex items-center gap-1.5">
                          <Icon name="User" size={12} /> {g.author}
                        </span>
                        <span className="text-xs text-white/70 flex items-center gap-1">
                          <Icon name="Heart" size={12} className="text-primary" /> {g.likes}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* HISTORY */}
          <TabsContent value="history" className="animate-fade-in">
            <Card className="glass border-white/10">
              <CardContent className="p-2 sm:p-4">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead>ID</TableHead>
                      <TableHead>Промпт</TableHead>
                      <TableHead className="hidden sm:table-cell">Провайдер</TableHead>
                      <TableHead className="hidden md:table-cell">Размер</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead className="text-right">Дата</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {HISTORY.map((h) => (
                      <TableRow key={h.id} className="border-border">
                        <TableCell className="font-mono text-xs text-muted-foreground">{h.id}</TableCell>
                        <TableCell className="font-medium">{h.prompt}</TableCell>
                        <TableCell className="hidden sm:table-cell text-muted-foreground">{h.provider}</TableCell>
                        <TableCell className="hidden md:table-cell font-mono text-xs text-muted-foreground">{h.size}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              h.status === 'Готово'
                                ? 'border-accent/40 text-accent'
                                : h.status === 'В очереди'
                                ? 'border-primary/40 text-primary'
                                : 'border-destructive/40 text-destructive'
                            }
                          >
                            {h.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground">{h.date}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border">
        <div className="container py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg gradient-bg flex items-center justify-center">
              <Icon name="Sparkles" size={15} className="text-white" />
            </div>
            <span className="font-display font-bold">NeuroArt</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2026 NeuroArt — генерация изображений с ИИ</p>
          <div className="flex gap-2">
            {['Send', 'Github', 'Mail'].map((ic) => (
              <Button key={ic} size="icon" variant="outline" className="w-9 h-9 border-border">
                <Icon name={ic} size={16} />
              </Button>
            ))}
          </div>
        </div>
      </footer>

      {/* PREVIEW DIALOG */}
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
                <a href={preview} download>
                  <Icon name="Download" size={18} className="mr-2" /> Скачать в высоком качестве
                </a>
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
