import { useState, useEffect } from "react";
import { collection, query, getDocs } from "firebase/firestore";
import { db } from "../configs/FirebaseConfig";
export const useCategoryList = () => {
  const [categoryList, setCategoryList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const getCategoryList = async () => {
    setIsLoading(true);
    setCategoryList([]); // Reset the category list
    try {
      const q = query(collection(db, "categories"));
      const querySnapshot = await getDocs(q);

      const categories = [];
      querySnapshot.forEach((doc) => {
        const { icon, name, id } = doc.data();
        categories.push({ id, icon, name });
      });

      setCategoryList(categories);
      setError(null);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getCategoryList();
  }, []);

  return { categoryList, isLoading, error, refreshCategories: getCategoryList };
};
