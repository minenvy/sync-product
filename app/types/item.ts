export type Item = {
  itemId: string;
  title: string;
  shortDescription: string;
  price: {
    value: string;
    currency: string;
  };
  categoryPath: string;
  image: {
    imageUrl: string;
  };
  itemCreationDate: string;
  localizedAspects: Array<{
    type: string;
    name: string;
    value: string;
  }>;
  description: string;
} & Record<string, string>;
