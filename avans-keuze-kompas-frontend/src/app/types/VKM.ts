export type VKM = {
  _id: number;
  id: number;
  name: string;
  shortdescription: string;
  description: string;
  content: string;
  studycredit: number;
  location: string;
  contact_id: number;
  level: string;
  learningoutcomes: string;
};
export type VKMInput = {
  id: number | string;
  name: string;
  shortdescription: string;
  content: string;
  studycredit: number;
  location: string;
  contact_id: number;
  level: string;
};
