import type { FolderData } from "@/types/folder";

export const sampleFolders: FolderData[] = [
  {
    id: "projects",
    name: "Projects",
    files: [
      {
        id: "1",
        title: "Things to do today",
        date: "2025-05-07T16:34:00",
        checklist: [
          { id: "c1", text: "Reach 600 followers", completed: true },
          { id: "c2", text: "Post on X", completed: true },
          { id: "c3", text: "Client work", completed: true },
          { id: "c4", text: "Work on miniKIT", completed: false },
          { id: "c5", text: "Work on filelist", completed: false },
        ],
      },
      {
        id: "2",
        title: "Project ideas",
        date: "2025-05-06T10:15:00",
        preview: "A collection of innovative project ideas for Q2 including the new dashboard redesign and mobile app features.",
      },
      {
        id: "3",
        title: "Meeting notes",
        date: "2025-05-05T14:00:00",
        preview: "Key takeaways from the team sync: prioritize user feedback, launch beta by end of month.",
      },
    ],
  },
  {
    id: "personal",
    name: "Personal",
    files: [
      {
        id: "4",
        title: "Reading list",
        date: "2025-05-04T09:00:00",
        checklist: [
          { id: "c6", text: "Atomic Habits", completed: true },
          { id: "c7", text: "Deep Work", completed: false },
          { id: "c8", text: "The Pragmatic Programmer", completed: false },
        ],
      },
    ],
  },
  {
    id: "archive",
    name: "Archive",
    files: [],
  },
];

export const getFolderById = (id: string): FolderData | undefined => {
  return sampleFolders.find(folder => folder.id === id);
};
