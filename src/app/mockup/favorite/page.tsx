"use client";
import { useEffect, useState } from "react";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import AddMockupModal from "./AddMockupModal";
import { useRouter } from 'next/navigation';
import { authService } from "@/services/authService";
import axios from 'axios';
import DefaultLayout from "@/components/Layouts/DefaultLayout";

interface FavoriteList {
  id: number;
  name: string;
  category: string;
  mockups: Mockup[];
}

interface Mockup {
  id: number;
  name: string;
}

const FavoritePage = () => {
  const router = useRouter();
  const [lists, setLists] = useState<FavoriteList[]>([]);
  const [newListName, setNewListName] = useState("");
  const [newListCategory, setNewListCategory] = useState("");
  const [mockups, setMockups] = useState<Mockup[]>([]);
  const [selectedListId, setSelectedListId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchLists = async () => {
    try {
      const token = authService.getToken();
      if (!token) {
        router.push('/login');
        return;
      }

      const user = authService.getCurrentUser();
      if (!user?.userId) {
        console.error("User ID not found");
        router.push('/login');
        return;
      }

      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002';
      const response = await axios.get(`${API_URL}/api/Favorite/${user.userId}/lists`);
      if (response.data.success) {
        setLists(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching lists:", error);
    }
  };

  const fetchMockups = async () => {
    try {
      const token = authService.getToken();
      if (!token) return;

      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002';
      const response = await axios.get(`${API_URL}/api/Mockup`);
      if (response.data.success) {
        setMockups(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching mockups:", error);
    }
  };

  const createList = async () => {
    try {
      const token = authService.getToken();
      if (!token) return;

      const user = authService.getCurrentUser();
      if (!user?.userId || !newListName || !newListCategory) return;

      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002';
      const response = await axios.post(
        `${API_URL}/api/Favorite/${user.userId}/lists?listName=${encodeURIComponent(
          newListName
        )}&category=${encodeURIComponent(newListCategory)}`
      );
      
      if (response.data.success) {
        setNewListName("");
        setNewListCategory("");
        fetchLists();
      }
    } catch (error) {
      console.error("Error creating list:", error);
    }
  };

  const deleteList = async (listId: number) => {
    try {
      const token = authService.getToken();
      if (!token) return;

      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002';
      const response = await axios.delete(`${API_URL}/api/Favorite/lists/${listId}`);
      
      if (response.data.success) {
        fetchLists();
      }
    } catch (error) {
      console.error("Error deleting list:", error);
    }
  };

  const addMockupToList = async (listId: number, mockupId: number) => {
    try {
      const token = authService.getToken();
      if (!token) return;

      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002';
      const response = await axios.post(
        `${API_URL}/api/Favorite/lists/${listId}/mockups/${mockupId}`
      );
      
      if (response.data.success) {
        fetchLists();
      }
    } catch (error) {
      console.error("Error adding mockup to list:", error);
    }
  };

  const removeMockupFromList = async (listId: number, mockupId: number) => {
    try {
      const token = authService.getToken();
      if (!token) return;

      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002';
      const response = await axios.delete(
        `${API_URL}/api/Favorite/lists/${listId}/mockups/${mockupId}`
      );
      
      if (response.data.success) {
        fetchLists();
      }
    } catch (error) {
      console.error("Error removing mockup from list:", error);
    }
  };

  useEffect(() => {
    const token = authService.getToken();
    if (token) {
      const user = authService.getCurrentUser();
      console.log('Current user data:', user);
      console.log('User ID:', user?.userId);
      fetchLists();
      fetchMockups();
    } else {
      router.push('/login');
    }
  }, []);

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <Breadcrumb pageName="Favorites" />
        
        <div className="flex flex-col gap-10">
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
              <h3 className="font-medium text-black dark:text-white">
                Create New Favorite List
              </h3>
            </div>
            <div className="p-6.5">
              <div className="mb-4.5">
                <label className="mb-2.5 block text-black dark:text-white">
                  List Name
                </label>
                <input
                  type="text"
                  placeholder="Enter list name"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                />
              </div>

              <div className="mb-4.5">
                <label className="mb-2.5 block text-black dark:text-white">
                  Category
                </label>
                <input
                  type="text"
                  placeholder="Enter category"
                  value={newListCategory}
                  onChange={(e) => setNewListCategory(e.target.value)}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                />
              </div>

              <button
                onClick={createList}
                className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90"
              >
                Create List
              </button>
            </div>
          </div>

          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke px-4 py-4 dark:border-strokedark sm:px-6.5">
              <h3 className="font-medium text-black dark:text-white">
                Your Favorite Lists
              </h3>
            </div>
            <div className="max-w-full overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-2 text-left dark:bg-meta-4">
                    <th className="min-w-[220px] px-4 py-4 font-medium text-black dark:text-white xl:pl-11">
                      List Name
                    </th>
                    <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white">
                      Category
                    </th>
                    <th className="px-4 py-4 font-medium text-black dark:text-white">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {lists.map((list) => (
                    <tr key={list.id}>
                      <td className="border-b border-[#eee] px-4 py-5 pl-9 xl:pl-11">
                        <h5 className="font-medium text-black dark:text-white">
                          {list.name}
                        </h5>
                        {list.mockups && list.mockups.length > 0 && (
                          <div className="mt-2.5 flex flex-wrap gap-2">
                            {list.mockups.map((mockup) => (
                              <span
                                key={mockup.id}
                                className="inline-flex items-center gap-2 rounded-md bg-gray-2 px-3 py-1 text-sm font-medium text-black dark:bg-meta-4 dark:text-white"
                              >
                                {mockup.name}
                                <button
                                  onClick={() =>
                                    removeMockupFromList(list.id, mockup.id)
                                  }
                                  className="text-meta-1 hover:text-meta-1"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="border-b border-[#eee] px-4 py-5">
                        <p className="text-black dark:text-white">
                          {list.category}
                        </p>
                      </td>
                      <td className="border-b border-[#eee] px-4 py-5">
                        <div className="flex items-center space-x-3.5">
                          <button
                            onClick={() => {
                              setSelectedListId(list.id);
                              setIsModalOpen(true);
                            }}
                            className="hover:text-primary"
                            title="Add Mockup"
                          >
                            <svg
                              className="fill-current"
                              width="18"
                              height="18"
                              viewBox="0 0 18 18"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M9 3.75V14.25M14.25 9H3.75"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => deleteList(list.id)}
                            className="hover:text-meta-1"
                            title="Delete List"
                          >
                            <svg
                              className="fill-current"
                              width="18"
                              height="18"
                              viewBox="0 0 18 18"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M13.7535 2.47502H11.5879V1.9969C11.5879 1.15315 10.9129 0.478149 10.0691 0.478149H7.90352C7.05977 0.478149 6.38477 1.15315 6.38477 1.9969V2.47502H4.21914C3.40352 2.47502 2.72852 3.15002 2.72852 3.96565V4.8094C2.72852 5.42815 3.09414 5.9344 3.62852 6.1594L4.07852 15.4688C4.13477 16.6219 5.09102 17.5219 6.24414 17.5219H11.7004C12.8535 17.5219 13.8098 16.6219 13.866 15.4688L14.3441 6.13127C14.8785 5.90627 15.2441 5.3719 15.2441 4.78127V3.93752C15.2441 3.15002 14.5691 2.47502 13.7535 2.47502ZM7.67852 1.9969C7.67852 1.85627 7.79102 1.74377 7.93164 1.74377H10.0973C10.2379 1.74377 10.3504 1.85627 10.3504 1.9969V2.47502H7.70664V1.9969H7.67852ZM4.02227 3.96565C4.02227 3.85315 4.10664 3.74065 4.24727 3.74065H13.7535C13.866 3.74065 13.9785 3.82502 13.9785 3.96565V4.8094C13.9785 4.9219 13.8941 5.0344 13.7535 5.0344H4.24727C4.13477 5.0344 4.02227 4.95002 4.02227 4.8094V3.96565ZM11.7285 16.2563H6.27227C5.79414 16.2563 5.40039 15.8906 5.37227 15.3844L4.95039 6.2719H13.0785L12.6566 15.3844C12.6004 15.8625 12.2066 16.2563 11.7285 16.2563Z"
                                fill=""
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <AddMockupModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedListId(null);
        }}
        onAdd={(mockupId) => {
          if (selectedListId) {
            addMockupToList(selectedListId, mockupId);
          }
        }}
        mockups={mockups}
      />
    </DefaultLayout>
  );
};

export default FavoritePage; 