'use client';

import React, { useState } from 'react';
import { useData } from '@/lib/data-context';
import { useAuth } from '@/lib/auth-context';
import { 
  Users, 
  ShieldCheck, 
  Plus, 
  Pencil, 
  Trash2, 
  Check, 
  X,
  UserPlus,
  Lock,
  Search,
  Settings as SettingsIcon,
  Save,
  Layout,
  Eye,
  EyeOff,
  LayoutDashboard,
  FileText,
  Package,
  RotateCcw,
  Zap,
  Building2,
  Truck,
  Archive,
  DollarSign,
  Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { User } from '@/lib/types';

const allModules = [
  { href: '/home', label: 'Dashboard', icon: 'LayoutDashboard' },
  { href: '/sales', label: 'Sales', icon: 'FileText' },
  { href: '/purchases', label: 'Purchases', icon: 'Package' },
  { href: '/returns', label: 'Returns', icon: 'RotateCcw' },
  { href: '/expenses', label: 'Expenses', icon: 'Zap' },
  { href: '/companies', label: 'Companies', icon: 'Building2' },
  { href: '/customers', label: 'Customers', icon: 'Users' },
  { href: '/dispatch', label: 'Dispatch', icon: 'Truck' },
  { href: '/inventory', label: 'Inventory', icon: 'Archive' },
  { href: '/payments', label: 'Payments', icon: 'DollarSign' },
  { href: '/notifications', label: 'Notifications', icon: 'Bell' },
  { href: '/settings', label: 'Settings', icon: 'Settings' },
];

export default function SettingsPage() {
  const { users, addUser, updateUser, deleteUser, isLoaded } = useData();
  const { user: currentUser, updateSessionUser } = useAuth();
  
  const [userSearch, setUserSearch] = useState('');
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  // User Form State
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    role: 'user' as 'admin' | 'user',
    accessibleModules: ['/home'] as string[]
  });

  if (!isLoaded || !currentUser) {
    return <div className="flex items-center justify-center h-[60vh]">Loading...</div>;
  }

  if (currentUser.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <ShieldCheck className="w-16 h-16 text-muted-foreground/20" />
        <h2 className="text-xl font-semibold">Access Denied</h2>
        <p className="text-muted-foreground">You do not have permission to view this page.</p>
      </div>
    );
  }

  const handleOpenAddModal = () => {
    setEditingUser(null);
    setShowPassword(false);
    setFormData({ 
      name: '', 
      username: '', 
      password: '', 
      role: 'user',
      accessibleModules: ['/home', '/sales', '/companies'] // Default set for new users
    });
    setIsUserModalOpen(true);
  };

  const handleOpenEditModal = (user: User) => {
    setEditingUser(user);
    setShowPassword(false);
    setFormData({ 
      name: user.name, 
      username: user.username, 
      password: user.password || '', 
      role: user.role,
      accessibleModules: user.accessibleModules || []
    });
    setIsUserModalOpen(true);
  };

  const handleSubmitUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      const updatedUser = { ...editingUser, ...formData };
      updateUser(updatedUser);
      
      // If we're updating the current user, sync the auth session immediately
      if (editingUser.id === currentUser.id) {
        updateSessionUser(updatedUser);
      }
      
      toast.success('User updated successfully');
    } else {
      addUser({
        id: Math.random().toString(36).substr(2, 9),
        ...formData
      });
      toast.success('User created successfully');
    }
    setIsUserModalOpen(false);
  };

  const handleDeleteUser = (id: string) => {
    if (id === currentUser.id) {
      toast.error('You cannot delete yourself');
      return;
    }
    if (confirm('Are you sure you want to delete this user?')) {
      deleteUser(id);
      toast.success('User deleted successfully');
    }
  };

  const toggleModuleAccess = (moduleHref: string) => {
    setFormData(prev => {
      const isAccessible = prev.accessibleModules.includes(moduleHref);
      if (isAccessible) {
        return {
          ...prev,
          accessibleModules: prev.accessibleModules.filter(m => m !== moduleHref)
        };
      } else {
        return {
          ...prev,
          accessibleModules: [...prev.accessibleModules, moduleHref]
        };
      }
    });
  };

  const handleSelectAll = () => {
    setFormData(prev => ({
      ...prev,
      accessibleModules: ['/home', ...allModules.map(m => m.href)]
    }));
  };

  const handleSelectNone = () => {
    setFormData(prev => ({
      ...prev,
      accessibleModules: ['/home']
    }));
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(userSearch.toLowerCase()) || 
    u.username.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage users and their individual page access.</p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Users</CardTitle>
            <CardDescription>Manage team members and configure their specific module access.</CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="pl-9"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
            </div>
            <Button onClick={handleOpenAddModal} className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Add User
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Access</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-[300px]">
                      {user.accessibleModules?.map(m => (
                        <Badge key={m} variant="outline" className="text-[10px] px-1 py-0 h-4">
                          {allModules.find(am => am.href === m)?.label || m.replace('/', '')}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleOpenEditModal(user)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => handleDeleteUser(user.id)}
                      disabled={user.id === currentUser.id}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    No users found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* User Modal */}
      <Dialog open={isUserModalOpen} onOpenChange={setIsUserModalOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none shadow-2xl">
          <form onSubmit={handleSubmitUser}>
            <DialogHeader className="p-8 pb-4">
              <DialogTitle className="text-2xl font-bold">{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
              <DialogDescription className="text-base">
                Configure user profile and module permissions.
              </DialogDescription>
            </DialogHeader>
            
            <div className="px-8 pb-8 space-y-6">
              {/* Profile Section */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name" className="text-sm font-semibold">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter full name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary h-10"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="role" className="text-sm font-semibold">Role</Label>
                    <Select 
                      value={formData.role} 
                      onValueChange={(value: 'admin' | 'user') => setFormData({ ...formData, role: value })}
                    >
                      <SelectTrigger className="bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary h-10">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Administrator</SelectItem>
                        <SelectItem value="user">Standard User</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="username" className="text-sm font-semibold">Username</Label>
                    <Input
                      id="username"
                      placeholder="username"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      required
                      className="bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary h-10"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password" className="text-sm font-semibold">Password</Label>
                    <div className="relative group/pass">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required={!editingUser}
                        className="bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary h-10 pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors h-8 w-8"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Page Access Section - Reference Match */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm font-bold text-foreground">Page Access</Label>
                    <div className="flex items-center gap-1.5 ml-2">
                      <Button 
                        type="button" 
                        variant="link"
                        size="sm"
                        onClick={handleSelectAll}
                        className="h-auto p-0 text-[13px]"
                      >
                        Select All
                      </Button>
                      <span className="text-muted-foreground/30 text-xs">|</span>
                      <Button 
                        type="button" 
                        variant="link"
                        size="sm"
                        onClick={handleSelectNone}
                        className="h-auto p-0 text-[13px]"
                      >
                        None
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="border border-border rounded-xl p-6 bg-card/50">
                  <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                    {/* Fixed Home Access */}
                    <div className="flex items-center space-x-3 opacity-60">
                      <Checkbox checked disabled id="mod-home" className="h-4.5 w-4.5 rounded-[4px] border-muted-foreground/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
                      <Label htmlFor="mod-home" className="text-[14px] font-medium leading-none cursor-not-allowed">
                        Home
                      </Label>
                    </div>
                    
                    {allModules.map((module) => (
                      <div key={module.href} className="flex items-center space-x-3 group">
                        <Checkbox
                          id={`mod-${module.href}`}
                          checked={formData.accessibleModules.includes(module.href)}
                          onCheckedChange={() => toggleModuleAccess(module.href)}
                          disabled={formData.role === 'admin' && module.href === '/settings'}
                          className="h-4.5 w-4.5 rounded-[4px] border-muted-foreground/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-colors"
                        />
                        <Label 
                          htmlFor={`mod-${module.href}`} 
                          className="text-[14px] font-medium leading-none cursor-pointer group-hover:text-primary transition-colors"
                        >
                          {module.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="px-8 py-6 bg-muted/20 border-t flex flex-row justify-end gap-3">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setIsUserModalOpen(false)}
                className="hover:bg-muted font-medium"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="px-8 font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
              >
                {editingUser ? 'Save Changes' : 'Create User'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
