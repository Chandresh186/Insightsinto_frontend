export interface Folder {
    id: string;
    catName: string;
    parentCatId: string | null;
    isOpen: boolean;
    contents: Content[];
    subCategories: Folder[];
    isActive?: boolean; // Add this for UI state
  }
  
 export interface Content {
    id: string;
    title: string;
    type: string;
    url: string;
  }
  