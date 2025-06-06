
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Settings, Plus, Edit, Trash2, Palette } from 'lucide-react';
import { useTaskCategories } from '@/hooks/useTaskCategories';

interface TaskCategoriesManagerProps {
  projectId: string;
}

const TaskCategoriesManager = ({ projectId }: TaskCategoriesManagerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#3B82F6');
  
  const { categories, loading, createCategory, updateCategory, deleteCategory } = useTaskCategories(projectId);

  const predefinedColors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
  ];

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    await createCategory({
      name: newCategoryName.trim(),
      color: newCategoryColor,
    });

    setNewCategoryName('');
    setNewCategoryColor('#3B82F6');
    setIsCreating(false);
  };

  const handleUpdateCategory = async (id: string, updates: any) => {
    await updateCategory(id, updates);
    setEditingCategory(null);
  };

  const handleDeleteCategory = async (id: string) => {
    if (confirm('Are you sure you want to delete this category? Tasks using this category will not be affected.')) {
      await deleteCategory(id);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="w-4 h-4 mr-2" />
          Categories
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Task Categories</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium">Categories</h3>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsCreating(true)}
              disabled={isCreating}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>

          {isCreating && (
            <form onSubmit={handleCreateCategory} className="space-y-3 p-3 bg-gray-50 rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="categoryName">Name</Label>
                <Input
                  id="categoryName"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Category name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex gap-2 flex-wrap">
                  {predefinedColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`w-6 h-6 rounded-full border-2 ${
                        newCategoryColor === color ? 'border-gray-800' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setNewCategoryColor(color)}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" size="sm">Create</Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsCreating(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {loading ? (
              <p className="text-sm text-gray-600">Loading categories...</p>
            ) : categories.length === 0 ? (
              <p className="text-sm text-gray-600">No categories created yet.</p>
            ) : (
              categories.map((category) => (
                <div key={category.id} className="flex items-center justify-between p-2 bg-white rounded border">
                  {editingCategory === category.id ? (
                    <div className="flex-1 space-y-2">
                      <Input
                        defaultValue={category.name}
                        onBlur={(e) => {
                          if (e.target.value !== category.name) {
                            handleUpdateCategory(category.id, { name: e.target.value });
                          } else {
                            setEditingCategory(null);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleUpdateCategory(category.id, { name: e.currentTarget.value });
                          } else if (e.key === 'Escape') {
                            setEditingCategory(null);
                          }
                        }}
                        autoFocus
                      />
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 flex-1">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="text-sm">{category.name}</span>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingCategory(category.id)}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteCategory(category.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskCategoriesManager;
