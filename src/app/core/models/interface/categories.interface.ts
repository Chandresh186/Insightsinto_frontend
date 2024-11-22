export interface Category {
    id: string;            
    catName: string;        
    parentCatId: string | null;  
  }


export interface apiResponse {
    status: boolean,
    message: string,
    response : Category[] | null;
}


export interface SubCategory {
    id: string;
    catName: string;
    parentCatId: string | null;
    subCategories: SubCategory[];
  }
  
  export interface CategoryList {
    id: string;
    catName: string;
    parentCatId: string | null;
    subCategories: SubCategory[];
  }