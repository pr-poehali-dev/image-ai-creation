import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';

const CONTACTS = [
  { icon: 'Mail', title: 'Email', value: 'hello@neuroart.ai' },
  { icon: 'Send', title: 'Telegram', value: '@neuroart_support' },
  { icon: 'MapPin', title: 'Адрес', value: 'Москва, орбита Земли' },
];

const Contacts = () => {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!form.name || !form.email || !form.message) {
      toast({ title: 'Заполните все обязательные поля', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      await api.contact(form);
      toast({ title: 'Сообщение отправлено!', description: 'Мы свяжемся с вами в ближайшее время' });
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (e) {
      toast({ title: 'Ошибка', description: (e as Error).message, variant: 'destructive' });
    } finally { setLoading(false); }
  };

  return (
    <div className="container py-12">
      <div className="text-center mb-12">
        <h1 className="font-display font-black text-4xl mb-3">Свяжитесь с нами</h1>
        <p className="text-muted-foreground">Вопросы, предложения или сотрудничество — пишите!</p>
      </div>

      <div className="grid md:grid-cols-[1fr_1.5fr] gap-6 max-w-4xl mx-auto">
        <div className="space-y-4">
          {CONTACTS.map((c) => (
            <Card key={c.title} className="glass border-white/10 glow-hover">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl gradient-bg flex items-center justify-center shrink-0">
                  <Icon name={c.icon} size={20} className="text-white" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">{c.title}</div>
                  <div className="font-semibold">{c.value}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="glass border-white/10">
          <CardContent className="p-6 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="mb-1.5 block">Имя *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-input/60" />
              </div>
              <div>
                <Label className="mb-1.5 block">Email *</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="bg-input/60" />
              </div>
            </div>
            <div>
              <Label className="mb-1.5 block">Тема</Label>
              <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="bg-input/60" />
            </div>
            <div>
              <Label className="mb-1.5 block">Сообщение *</Label>
              <Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="min-h-32 bg-input/60 resize-none" />
            </div>
            <Button onClick={submit} disabled={loading} className="w-full gradient-bg text-white border-0 glow-hover h-11">
              {loading ? <Icon name="Loader2" size={18} className="animate-spin" /> : <><Icon name="Send" size={16} className="mr-2" /> Отправить</>}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Contacts;
