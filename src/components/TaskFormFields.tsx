
import React from 'react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, User } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from "@/lib/utils";

interface TaskFormFieldsProps {
  title: string;
  setTitle: (title: string) => void;
  description: string;
  setDescription: (description: string) => void;
  columnId: string;
  setColumnId: (columnId: string) => void;
  priority: string;
  setPriority: (priority: string) => void;
  categoryId: string;
  setCategoryId: (categoryId: string) => void;
  assigneeId: string;
  setAssigneeId: (assigneeId: string) => void;
  dueDate: Date | undefined;
  setDueDate: (date: Date | undefined) => void;
  showCalendar: boolean;
  setShowCalendar: (show: boolean) => void;
  columns: any[];
  categories: any[];
  members: any[];
}

const TaskFormFields = ({
  title,
  setTitle,
  description,
  setDescription,
  columnId,
  setColumnId,
  priority,
  setPriority,
  categoryId,
  setCategoryId,
  assigneeId,
  setAssigneeId,
  dueDate,
  setDueDate,
  showCalendar,
  setShowCalendar,
  columns,
  categories,
  members
}: TaskFormFieldsProps) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter task title"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter task description"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Column *</Label>
          <Select value={columnId} onValueChange={setColumnId}>
            <SelectTrigger>
              <SelectValue placeholder="Select column" />
            </SelectTrigger>
            <SelectContent>
              {columns.map((column) => (
                <SelectItem key={column.id} value={column.id}>
                  {column.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Priority</Label>
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No category</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: category.color }}
                    />
                    {category.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Assignee</Label>
          <Select value={assigneeId} onValueChange={setAssigneeId}>
            <SelectTrigger>
              <SelectValue placeholder="Select assignee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Unassigned
                </div>
              </SelectItem>
              {members.map((member) => (
                <SelectItem key={member.user_id} value={member.user_id}>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {member.profile?.full_name || member.profile?.email || 'Unknown User'}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Due Date</Label>
        <Popover open={showCalendar} onOpenChange={setShowCalendar}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !dueDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dueDate ? format(dueDate, "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dueDate}
              onSelect={(date) => {
                setDueDate(date);
                setShowCalendar(false);
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default TaskFormFields;
