export interface FileItem {
  id: string;
  title: string;
  date: string;
  preview?: string;
  checklist?: ChecklistItem[];
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface FolderData {
  id: string;
  name: string;
  files: FileItem[];
}
