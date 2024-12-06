import { Category } from "./categories.interface";

export interface Test {
    id: string;
    title: string;
    subTitle: string;
    keywords: string[];
    files: string;
    minimumPassingScore: string;
    topics: string[];
    duration: string;
    language: string;
    categories: Category[];
    status: string;
  }