'use client'
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { addPassword, deletePassword, loadPasswords, togglePin } from '@/store/features/passwordManagerSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Eye, EyeOff, Copy, Plus, Search, Trash2, ExternalLink, Globe, Pin, PinOff, X } from 'lucide-react';
import NavBar from '@/components/myComponents/NavBar';
import { motion } from 'framer-motion';

interface PasswordEntry {
  id: string;
  label: string;
  username?: string;
  password: string;
  link?: string;
  description?: string;
  favicon?: string;
  pinned?: boolean;
  createdAt?: number;
}

export default function PasswordManager() {
  const dispatch = useDispatch();
  const passwords = useSelector((state: RootState) => state.passwordManager.passwords);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState<Partial<PasswordEntry>>({});
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
  const [showNewPassword, setShowNewPassword] = useState(false);

  useEffect(() => {
    const savedPasswords = localStorage.getItem('passwordManager');
    if (savedPasswords) {
      dispatch(loadPasswords(JSON.parse(savedPasswords)));
    }
  }, [dispatch]);

  useEffect(() => {
    localStorage.setItem('passwordManager', JSON.stringify(passwords));
  }, [passwords]);

  const handleAddPassword = () => {
    if (!newPassword.label || !newPassword.password) {
      toast.error('Label and password are required');
      return;
    }
    const id = Date.now().toString();
    const favicon = newPassword.link ? getFavicon(newPassword.link) : newPassword.label.charAt(0).toUpperCase();
    const passwordEntry: PasswordEntry = {
      id,
      label: newPassword.label,
      username: newPassword.username,
      password: newPassword.password,
      link: newPassword.link,
      description: newPassword.description,
      favicon,
      pinned: false,
      createdAt: Date.now(),
    };
    dispatch(addPassword(passwordEntry));
    setNewPassword({});
    setIsModalOpen(false);
    toast.success('Password added successfully');
  };

  const getFavicon = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    } catch {
      return '';
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} copied to clipboard`);
  };

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleDeletePassword = (id: string) => {
    dispatch(deletePassword(id));
    toast.success('Password deleted successfully');
  };

  const filteredPasswords = passwords
    .filter(password =>
      password.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (password.username && password.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (password.description && password.description.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      // Pinned passwords come first
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;

      // Within pinned/unpinned groups, sort by creation date (latest first)
      const aTime = a.createdAt || 0;
      const bTime = b.createdAt || 0;
      return bTime - aTime;
    });

  return (
    <div className="min-h-screen bg-background">
      <div className="p-2 xl:p-3">
        <NavBar />
      </div>
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-primary">Password Manager</h1>
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen} >
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus size={16} />
                  Add Password
                </Button>
              </DialogTrigger>
              <DialogContent className='md:min-w-md'>
                <DialogHeader>
                  <DialogTitle>Add New Password</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="label">Label *</Label>
                    <Input
                      id="label"
                      value={newPassword.label || ''}
                      onChange={(e) => setNewPassword({ ...newPassword, label: e.target.value })}
                      placeholder="e.g., Gmail"
                      autoComplete="off"
                    />
                  </div>
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={newPassword.username || ''}
                      onChange={(e) => setNewPassword({ ...newPassword, username: e.target.value })}
                      placeholder="e.g., user@example.com"
                      autoComplete="off"
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Password *</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword.password || ''}
                        onChange={(e) => setNewPassword({ ...newPassword, password: e.target.value })}
                        placeholder="Enter password"
                        autoComplete="off"
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="link">Website Link</Label>
                    <Input
                      id="link"
                      value={newPassword.link || ''}
                      onChange={(e) => setNewPassword({ ...newPassword, link: e.target.value })}
                      placeholder="https://example.com"
                      autoComplete="off"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newPassword.description || ''}
                      onChange={(e) => setNewPassword({ ...newPassword, description: e.target.value })}
                      placeholder="Optional description"
                    />
                  </div>
                  <Button onClick={handleAddPassword} className="w-full">
                    Add Password
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                placeholder="Search passwords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-10 ${searchTerm ? 'pr-10' : ''}`}
                autoComplete="off"
              />
              {searchTerm && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setSearchTerm('')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          <motion.div
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
            layout
          >
            {filteredPasswords.map((password) => (
              <motion.div
                key={password.id}
                layout
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{
                  duration: 0.3,
                  layout: { duration: 0.3 }
                }}
              >
                <Card className="h-full">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="flex items-center gap-2">
                      {password.favicon && password.favicon.startsWith('http') ? (
                        <img src={password.favicon} alt="favicon" className="w-6 h-6 rounded" />
                      ) : (
                        <div className="w-6 h-6  text-secondary-foreground rounded flex items-center justify-center text-xs font-bold">
                          <Globe />
                        </div>
                      )}
                      <CardTitle className="text-lg">{password.label}</CardTitle>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          dispatch(togglePin(password.id));
                          toast.success(password.pinned ? 'Password unpinned' : 'Password pinned');
                        }}
                        className={password.pinned ? 'text-yellow-600 hover:text-yellow-700' : 'text-muted-foreground hover:text-foreground'}
                      >
                        {password.pinned ? <PinOff size={16} /> : <Pin size={16} />}
                      </Button>
                      {password.link && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(password.link, '_blank')}
                          className="text-blue-500 hover:text-blue-600"
                        >
                          <ExternalLink size={16} />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePassword(password.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {password.username && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Username:</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{password.username}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(password.username!, 'Username')}
                          >
                            <Copy size={14} />
                          </Button>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Password:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">
                          {visiblePasswords.has(password.id) ? password.password : '••••••••'}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => togglePasswordVisibility(password.id)}
                        >
                          {visiblePasswords.has(password.id) ? <EyeOff size={14} /> : <Eye size={14} />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(password.password, 'Password')}
                        >
                          <Copy size={14} />
                        </Button>
                      </div>
                    </div>
                    {password.description && (
                      <div>
                        <span className="text-sm text-muted-foreground">Description:</span>
                        <p className="text-sm mt-1">{password.description}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
          {filteredPasswords.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No passwords found. Add your first password!</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
