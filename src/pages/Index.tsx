import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { api } from '@/lib/api';

const FEATURES = [
  { icon: 'Cpu', title: '4 нейросети', text: 'Caila, Chutes, Cerebras и OpenAI — выбирай лучший движок под задачу.' },
  { icon: 'Palette', title: 'Гибкие стили', text: 'Кибербанк, аниме, реализм, фэнтези, 3D и масло в один клик.' },
  { icon: 'Zap', title: 'Молниеносно', text: 'Изображение готово за секунды. Очередь и приоритет для PRO.' },
  { icon: 'Shield', title: 'Приватность', text: 'Управляй видимостью работ: храни приватно или делись в галерее.' },
  { icon: 'Download', title: 'Скачивание', text: 'Сохраняй результат в высоком качестве без водяных знаков.' },
  { icon: 'History', title: 'История', text: 'Все генерации сохраняются — возвращайся к ним в любой момент.' },
];

const STEPS = [
  { n: '01', title: 'Опиши идею', text: 'Введи текстовое описание будущего изображения.' },
  { n: '02', title: 'Настрой параметры', text: 'Выбери стиль, провайдера, размер и качество.' },
  { n: '03', title: 'Получи результат', text: 'Смотри, скачивай и делись своим шедевром.' },
];

const FAQ = [
  { q: 'Это бесплатно?', a: 'На старте вы получаете 30 кредитов бесплатно. Дальше — гибкие тарифы под любой объём.' },
  { q: 'Какие нейросети используются?', a: 'Caila, Chutes, Cerebras и OpenAI — все совместимы с OpenAI API и дают разный визуальный результат.' },
  { q: 'Могу ли я использовать изображения коммерчески?', a: 'Да, на тарифах Профи и Бизнес вы получаете права на коммерческое использование без водяных знаков.' },
  { q: 'Как работают кредиты?', a: 'Каждая генерация списывает кредиты в зависимости от выбранного провайдера. Баланс виден в шапке сайта.' },
];

const Index = () => {
  const [preview, setPreview] = useState<string[]>([]);

  useEffect(() => {
    api.gallery().then((d) => setPreview((d.images || []).slice(0, 8).map((i: { image_url: string }) => i.image_url))).catch(() => {});
  }, []);

  return (
    <div>
      <section className="container pt-20 pb-12 text-center relative overflow-hidden">
        <div className="absolute -z-10 left-1/2 top-0 -translate-x-1/2 w-[480px] h-[480px] rounded-full gradient-bg blur-[130px] opacity-30 animate-float" />
        <Badge className="mb-6 gradient-bg text-white border-0 px-4 py-1.5 animate-scale-in">
          <Icon name="Stars" size={14} className="mr-1.5" /> 4 нейросети в одном месте
        </Badge>
        <h1 className="font-display font-black text-4xl md:text-6xl leading-tight mb-5 animate-fade-in">
          Создавай <span className="gradient-text">шедевры</span>
          <br />силой искусственного интеллекта
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          Опиши идею словами — Caila, Chutes, Cerebras и OpenAI воплотят её в изображение за секунды.
        </p>
        <div className="flex items-center justify-center gap-3 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <Link to="/generator">
            <Button size="lg" className="gradient-bg text-white border-0 glow-hover h-12 px-7 text-base font-semibold">
              <Icon name="Wand2" size={18} className="mr-2" /> Начать творить
            </Button>
          </Link>
          <Link to="/gallery">
            <Button size="lg" variant="outline" className="h-12 px-7 text-base border-border">Галерея работ</Button>
          </Link>
        </div>

        {preview.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-14 max-w-4xl mx-auto">
            {preview.map((url, i) => (
              <div key={i} className="aspect-square rounded-2xl overflow-hidden glow-hover animate-scale-in" style={{ animationDelay: `${i * 0.05}s` }}>
                <img src={url} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="container py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { v: '4', l: 'AI-провайдера' },
            { v: '6', l: 'стилей' },
            { v: '∞', l: 'идей' },
            { v: '24/7', l: 'доступность' },
          ].map((s) => (
            <Card key={s.l} className="glass border-white/10 text-center">
              <CardContent className="py-6">
                <div className="font-display font-black text-3xl gradient-text">{s.v}</div>
                <div className="text-sm text-muted-foreground mt-1">{s.l}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="container py-16">
        <h2 className="font-display font-extrabold text-3xl md:text-4xl text-center mb-3">Всё для творчества</h2>
        <p className="text-muted-foreground text-center mb-12">Мощные инструменты в простом интерфейсе</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <Card key={f.title} className="glass border-white/10 glow-hover">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center mb-4 glow">
                  <Icon name={f.icon} size={22} className="text-white" />
                </div>
                <h3 className="font-display font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm">{f.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="container py-16">
        <h2 className="font-display font-extrabold text-3xl md:text-4xl text-center mb-12">Как это работает</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {STEPS.map((s) => (
            <Card key={s.n} className="glass border-white/10 relative overflow-hidden">
              <CardContent className="p-8">
                <span className="font-display font-black text-6xl text-primary/15 absolute top-2 right-4">{s.n}</span>
                <h3 className="font-display font-bold text-xl mb-2 relative">{s.title}</h3>
                <p className="text-muted-foreground text-sm relative">{s.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="container py-16 max-w-3xl">
        <h2 className="font-display font-extrabold text-3xl md:text-4xl text-center mb-12">Частые вопросы</h2>
        <Accordion type="single" collapsible className="space-y-3">
          {FAQ.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="glass border-white/10 rounded-xl px-5">
              <AccordionTrigger className="font-semibold text-left">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <section className="container py-16">
        <Card className="glass border-white/10 overflow-hidden relative">
          <div className="absolute inset-0 gradient-bg opacity-10" />
          <CardContent className="py-16 text-center relative">
            <h2 className="font-display font-black text-3xl md:text-4xl mb-4">Готов создать свой шедевр?</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">Зарегистрируйся и получи 30 бесплатных кредитов прямо сейчас.</p>
            <Link to="/generator">
              <Button size="lg" className="gradient-bg text-white border-0 glow-hover h-12 px-8 text-base font-semibold">
                <Icon name="Sparkles" size={18} className="mr-2" /> Создать бесплатно
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default Index;