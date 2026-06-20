import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

const AuthDialog = ({ open, onOpenChange }: Props) => {
  const { login, register } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const submit = async (mode: 'login' | 'register') => {
    setLoading(true);
    try {
      if (mode === 'login') await login(email, password);
      else await register(email, password, name);
      toast({ title: 'Добро пожаловать!', description: 'Вы успешно вошли в NeuroArt' });
      onOpenChange(false);
      setEmail(''); setPassword(''); setName('');
    } catch (e) {
      toast({ title: 'Ошибка', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass max-w-md border-white/10">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
              <Icon name="Sparkles" size={16} className="text-white" />
            </div>
            NeuroArt
          </DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="login">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="login">Вход</TabsTrigger>
            <TabsTrigger value="register">Регистрация</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4">
            <div>
              <Label className="mb-1.5 block">Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@mail.ru" className="bg-input/60" />
            </div>
            <div>
              <Label className="mb-1.5 block">Пароль</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••" className="bg-input/60" />
            </div>
            <Button disabled={loading} onClick={() => submit('login')} className="w-full gradient-bg text-white border-0 glow-hover">
              {loading ? <Icon name="Loader2" size={16} className="animate-spin" /> : 'Войти'}
            </Button>
          </TabsContent>

          <TabsContent value="register" className="space-y-4">
            <div>
              <Label className="mb-1.5 block">Имя</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ваше имя" className="bg-input/60" />
            </div>
            <div>
              <Label className="mb-1.5 block">Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@mail.ru" className="bg-input/60" />
            </div>
            <div>
              <Label className="mb-1.5 block">Пароль</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="минимум 6 символов" className="bg-input/60" />
            </div>
            <Button disabled={loading} onClick={() => submit('register')} className="w-full gradient-bg text-white border-0 glow-hover">
              {loading ? <Icon name="Loader2" size={16} className="animate-spin" /> : 'Создать аккаунт'}
            </Button>
            <p className="text-xs text-muted-foreground text-center">Первый зарегистрированный аккаунт станет администратором</p>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AuthDialog;
