export interface User {
 /**
  * @isInt
  */
 id: number;
 email: string;
 name: string;
 status?: "Happy" | "Sad";
 phoneNumbers: string[];
}