export interface ProjectFile {
  path: string;
  name: string;
  language: string;
  description: string;
  content: string;
}

export interface HostingPlan {
  name: string;
  cpu: string;
  ram: string;
  disk: string;
  io: string;
  idealFor: string;
}
