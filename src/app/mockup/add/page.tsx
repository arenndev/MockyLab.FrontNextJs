'use client';

import React, { useEffect, useState, useCallback } from 'react';
import * as fabric from 'fabric';
import Layout from '@/components/Layouts/DefaultLayout';
import Image from 'next/image';
import axios from 'axios';
import Loader from '@/components/common/Loader';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import { parseJwt } from '@/services/authService';

// Enum tanımlamaları
enum TshirtCategory {
  TSHIRT = 'Tshirt',
  SWEATSHIRT = 'Sweatshirt',
  HOODIE = 'Hoodie',
  RACERBACK = 'Racerback',
  LONGSLEEVE = 'Longsleeve'
}

enum SizeCategory {
  ADULT = 'Adult',
  TODDLER = 'Toddler',
  YOUTH = 'Youth',
  ONESIE = 'Onesie'
}

enum GenderCategory {
  MALE = 'Male',
  FEMALE = 'Female',
  UNISEX = 'Unisex'
}

enum DesignColor {
  BLACK = 'Black',
  WHITE = 'White',
  COLOR = 'Color'
}

// Alert component
const Alert = ({ message, type }: { message: string; type: string }) => {
  let alertStyle = '';
  let iconBg = '';
  let textColor = '';
  let icon = null;

  switch (type) {
    case 'error':
      alertStyle = 'border-[#F87171] bg-[#F87171] bg-opacity-[15%]';
      iconBg = 'bg-[#F87171]';
      textColor = 'text-[#B45454]';
      icon = (
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6.4917 7.65579L11.106 12.2645C11.2545 12.4128 11.4715 12.5 11.6738 12.5C11.8762 12.5 12.0931 12.4128 12.2416 12.2645C12.5621 11.9445 12.5623 11.4317 12.2423 11.1114C12.2422 11.1113 12.2422 11.1113 12.2422 11.1113C12.242 11.1111 12.2418 11.1109 12.2416 11.1107L7.64539 6.50351L12.2589 1.91221L12.2595 1.91158C12.5802 1.59132 12.5802 1.07805 12.2595 0.757793C11.9393 0.437994 11.4268 0.437869 11.1064 0.757418C11.1063 0.757543 11.1062 0.757668 11.106 0.757793L6.49234 5.34931L1.89459 0.740581L1.89396 0.739942C1.57364 0.420019 1.0608 0.420019 0.740487 0.739944C0.42005 1.05999 0.419837 1.57279 0.73985 1.89309L6.4917 7.65579ZM6.4917 7.65579L1.89459 12.2639L1.89395 12.2645C1.74546 12.4128 1.52854 12.5 1.32616 12.5C1.12377 12.5 0.906853 12.4128 0.758361 12.2645L1.1117 11.9108L0.758358 12.2645C0.437984 11.9445 0.437708 11.4319 0.757539 11.1116C0.757812 11.1113 0.758086 11.111 0.75836 11.1107L5.33864 6.50287L0.740487 1.89373L6.4917 7.65579Z" fill="#ffffff" stroke="#ffffff"></path>
        </svg>
      );
      break;
    case 'success':
      alertStyle = 'border-[#34D399] bg-[#34D399] bg-opacity-[15%]';
      iconBg = 'bg-[#34D399]';
      textColor = 'text-black dark:text-[#34D399]';
      icon = (
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15.2984 0.826822L15.2868 0.811827L15.2741 0.797751C14.9173 0.401867 14.3238 0.400754 13.9657 0.794406L5.91888 9.45376L2.05667 5.2868C1.69856 4.89287 1.10487 4.89389 0.747996 5.28987C0.417335 5.65675 0.417335 6.22337 0.747996 6.59026L0.747959 6.59029L0.752701 6.59541L4.86742 11.0348C5.14445 11.3405 5.52858 11.5 5.89581 11.5C6.29242 11.5 6.65178 11.3355 6.92401 11.035L15.2162 2.11161C15.5833 1.74452 15.576 1.18615 15.2984 0.826822Z" fill="white" stroke="white"></path>
        </svg>
      );
      break;
    case 'warning':
      alertStyle = 'border-warning bg-warning bg-opacity-[15%]';
      iconBg = 'bg-warning';
      textColor = 'text-[#9D5425]';
      icon = (
        <svg width="19" height="16" viewBox="0 0 19 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1.50493 16H17.5023C18.6204 16 19.3413 14.9018 18.8354 13.9735L10.8367 0.770573C10.2852 -0.256858 8.70677 -0.256858 8.15528 0.770573L0.156617 13.9735C-0.334072 14.8998 0.386764 16 1.50493 16ZM10.7585 12.9298C10.7585 13.6155 10.2223 14.1433 9.45583 14.1433C8.6894 14.1433 8.15311 13.6155 8.15311 12.9298V12.9015C8.15311 12.2159 8.6894 11.688 9.45583 11.688C10.2223 11.688 10.7585 12.2159 10.7585 12.9015V12.9298ZM8.75236 4.01062H10.2548C10.6674 4.01062 10.9127 4.33826 10.8671 4.75288L10.2071 10.1186C10.1615 10.5049 9.88572 10.7455 9.50142 10.7455C9.11929 10.7455 8.84138 10.5028 8.79579 10.1186L8.13574 4.75288C8.09449 4.33826 8.33984 4.01062 8.75236 4.01062Z" fill="#FBBF24"></path>
        </svg>
      );
      break;
  }

  return (
    <div className="fixed top-4 right-4 z-[9999]">
      <div className={`flex w-full max-w-[400px] border-l-6 px-7 py-8 shadow-md dark:bg-[#1B1B24] dark:bg-opacity-30 md:p-9 ${alertStyle}`}>
        <div className={`mr-5 flex h-9 w-9 items-center justify-center rounded-lg ${iconBg}`}>
          {icon}
        </div>
        <div className="w-full">
          <h5 className={`mb-3 font-semibold ${textColor}`}>
            {message}
          </h5>
        </div>
      </div>
    </div>
  );
};

interface DesignRect extends fabric.Rect {
  designAreaName?: string;
}

const AddMockupPage = () => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = React.useState<fabric.Canvas | null>(null);
  const [rectangle, setRectangle] = React.useState<fabric.Group | null>(null);

  const [formData, setFormData] = React.useState({
    name: '',
    category: '',
    tshirtCategory: TshirtCategory.TSHIRT,
    sizeCategory: SizeCategory.ADULT,
    genderCategory: GenderCategory.UNISEX,
    designColor: DesignColor.BLACK,
    imageFile: null as File | null
  });

  const [alertState, setAlertState] = React.useState<{
    show: boolean;
    message: string;
    type: 'error' | 'success' | 'warning';
  }>({
    show: false,
    message: '',
    type: 'error'
  });

  const [originalImageSize, setOriginalImageSize] = React.useState<{width: number, height: number} | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  // Canvas initialization
  useEffect(() => {
    if (canvasRef.current) {
      if (canvas) {
        canvas.dispose();
      }

      const newCanvas = new fabric.Canvas(canvasRef.current, {
        width: 500,
        height: 500,
        backgroundColor: '#ffffff'
      });
      setCanvas(newCanvas);

      // Default rectangle oluştur
      const rect = new fabric.Rect({
        left: 0,
        top: 0,
        width: 100,
        height: 100,
        fill: 'black',
        strokeWidth: 0,
        originX: 'center',
        originY: 'center'
      }) as DesignRect;

      rect.designAreaName = 'Default Area';

      const text = new fabric.Text('Default Area', {
        fontSize: 14,
        fill: 'white',
        originX: 'center',
        originY: 'center'
      });

      const group = new fabric.Group([rect, text], {
        left: 200,
        top: 200,
        width: rect.width,
        height: rect.height,
        originX: 'center',
        originY: 'center'
      });

      newCanvas.add(group);
      setRectangle(group);

      return () => {
        newCanvas.dispose();
      };
    }
  }, []);

  // Design area oluşturma fonksiyonu
  const createNewDesignArea = (areaName: string) => {
    if (canvas) {
      const rect = new fabric.Rect({
        width: 100,
        height: 100,
        fill: 'black',
        strokeWidth: 0,
        originX: 'center',
        originY: 'center'
      }) as DesignRect;

      const text = new fabric.Text(areaName, {
        fontSize: 14,
        fill: 'white',
        originX: 'center',
        originY: 'center'
      });

      const group = new fabric.Group([rect, text], {
        left: canvas.width! / 2,
        top: canvas.height! / 2,
        originX: 'center',
        originY: 'center',
        centeredRotation: true
      });

      rect.designAreaName = areaName;
      canvas.add(group);
      canvas.renderAll();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && canvas) {
      setFormData(prev => ({
        ...prev,
        imageFile: file
      }));

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result && canvas) {
          const img = new window.Image();
          img.src = event.target.result as string;
          img.onload = () => {
            setOriginalImageSize({
              width: img.width,
              height: img.height
            });

            const fabricImage = new fabric.Image(img);
            const scale = Math.min(
              canvas.width! / fabricImage.width!,
              canvas.height! / fabricImage.height!
            );
            
            fabricImage.scale(scale);
            fabricImage.set({
              left: (canvas.width! - fabricImage.width! * scale) / 2,
              top: (canvas.height! - fabricImage.height! * scale) / 2,
              selectable: false,
              evented: false
            });
            
            // Tüm mevcut grupları sakla
            const groups = canvas.getObjects().filter(obj => obj instanceof fabric.Group);
            
            // Canvas'ı temizle
            canvas.clear();
            
            // Önce resmi ekle
            canvas.add(fabricImage);
            
            // Sonra tüm grupları tekrar ekle
            groups.forEach(group => {
              canvas.add(group);
            });
            
            canvas.renderAll();
          };
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);

      // Token kontrolü
      const token = authService.getToken();
      if (!token) {
        router.push('/auth/signin');
        return;
      }

      // User bilgisini al
      const currentUser = authService.getCurrentUser();
      console.log('Current user:', currentUser); // Debug için log ekleyelim
      
      if (!currentUser || !currentUser.userId) {
        router.push('/auth/signin');
        return;
      }

      if (!formData.imageFile) {
        throw new Error('Please select an image file');
      }

      if (!formData.name || !formData.category) {
        setAlertState({
          show: true,
          message: 'Please fill in all required fields',
          type: 'error'
        });
        return;
      }

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002';
      
      setAlertState({
        show: true,
        message: 'Creating mockup...',
        type: 'warning'
      });

      const formDataToSend = new FormData();
      formDataToSend.append('Name', formData.name);
      formDataToSend.append('Category', formData.category);
      formDataToSend.append('GenderCategory', formData.genderCategory);
      formDataToSend.append('DesignColor', formData.designColor);
      formDataToSend.append('TshirtCategory', formData.tshirtCategory);
      formDataToSend.append('SizeCategory', formData.sizeCategory);
      formDataToSend.append('ImageFile', formData.imageFile);
      formDataToSend.append('UserId', currentUser.userId);

      const response = await fetch(`${API_URL}/api/Mockup`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create mockup');
      }

      const result = await response.json();
      
      if (result.success && result.data?.id) {
        setAlertState({
          show: true,
          message: 'Creating design areas...',
          type: 'warning'
        });

        const groups = canvas?.getObjects().filter(obj => obj instanceof fabric.Group);
        
        if (groups && groups.length > 0) {
          const canvasImage = canvas?.getObjects().find(obj => obj instanceof fabric.Image) as fabric.Image;
          
          if (!originalImageSize) {
            throw new Error('Original image size not available');
          }

          const imageScaleX = originalImageSize.width / (canvasImage?.width! * canvasImage?.scaleX!);
          const imageScaleY = originalImageSize.height / (canvasImage?.height! * canvasImage?.scaleY!);

          for (const group of groups) {
            const groupBoundingRect = group.getBoundingRect();
            
            const groupCenter = group.getCenterPoint();

            const relativeCenterX = groupCenter.x - canvasImage?.left!;
            const relativeCenterY = groupCenter.y - canvasImage?.top!;

            const scaledWidth = Math.round(groupBoundingRect.width * imageScaleX);
            const scaledHeight = Math.round(groupBoundingRect.height * imageScaleY);
            const scaledCenterX = Math.round(relativeCenterX * imageScaleX);
            const scaledCenterY = Math.round(relativeCenterY * imageScaleY);

            const rect = group.getObjects().find(obj => obj instanceof fabric.Rect) as DesignRect;
            
            const designArea = {
              name: rect.designAreaName || 'Design Area',
              left: Math.max(0, scaledCenterX - (scaledWidth / 2)),
              top: Math.max(0, scaledCenterY - (scaledHeight / 2)),
              centerX: scaledCenterX,
              centerY: scaledCenterY,
              width: scaledWidth,
              height: scaledHeight,
              angle: group.angle || 0
            };

            await fetch(`${API_URL}/api/mockups/${result.data.id}/design-areas`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify(designArea)
            });
          }
        }

        setAlertState({
          show: true,
          message: 'Mockup and design areas created successfully! Redirecting...',
          type: 'success'
        });

        setTimeout(() => {
          router.push(`/mockup/edit?mockupId=${result.data.id}`);
        }, 1500);

        setFormData({
          name: '',
          category: '',
          tshirtCategory: TshirtCategory.TSHIRT,
          sizeCategory: SizeCategory.ADULT,
          genderCategory: GenderCategory.UNISEX,
          designColor: DesignColor.BLACK,
          imageFile: null
        });

        if (canvas) {
          canvas.clear();
          canvas.renderAll();
          
          createNewDesignArea('Default Area');
        }
      }

    } catch (error) {
      console.error('Error creating mockup:', error);
      setAlertState({
        show: true,
        message: error instanceof Error ? error.message : 'Failed to create mockup',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      {isLoading && <Loader />}
      
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-black dark:text-white">
            Add New Mockup
          </h2>
          <nav className="mt-4">
            <ol className="flex items-center gap-2">
              <li>
                <a className="font-medium" href="/mockup">
                  Mockups
                </a>
              </li>
              <li className="text-primary">/</li>
              <li className="text-primary">Add</li>
            </ol>
          </nav>
        </div>

        {alertState.show && (
          <Alert 
            message={alertState.message} 
            type={alertState.type} 
          />
        )}

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Canvas Bölümü */}
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
              <h3 className="font-medium text-black dark:text-white">
                Design Canvas
              </h3>
            </div>
            <div className="p-6.5">
              <div className="w-full max-w-[500px] mx-auto space-y-4">
                <canvas ref={canvasRef} className="border rounded-sm" />
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Design Area Name"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    id="designAreaName"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const nameInput = document.getElementById('designAreaName') as HTMLInputElement;
                      const areaName = nameInput.value.trim();
                      if (areaName) {
                        createNewDesignArea(areaName);
                        nameInput.value = '';
                      }
                    }}
                    className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-center font-medium text-white hover:bg-opacity-90"
                  >
                    Add New Design Area
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Form Bölümü */}
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
              <h3 className="font-medium text-black dark:text-white">
                Mockup Details
              </h3>
            </div>
            <div className="p-6.5">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-2.5 block font-medium text-black dark:text-white">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  />
                </div>

                <div>
                  <label className="mb-2.5 block font-medium text-black dark:text-white">
                    Category
                  </label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    placeholder="Enter category"
                  />
                </div>

                <div>
                  <label className="mb-2.5 block font-medium text-black dark:text-white">
                    T-Shirt Category
                  </label>
                  <select
                    name="tshirtCategory"
                    value={formData.tshirtCategory}
                    onChange={handleInputChange}
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  >
                    {Object.values(TshirtCategory).map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2.5 block font-medium text-black dark:text-white">
                    Size
                  </label>
                  <select
                    name="sizeCategory"
                    value={formData.sizeCategory}
                    onChange={handleInputChange}
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  >
                    {Object.values(SizeCategory).map(size => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2.5 block font-medium text-black dark:text-white">
                    Gender
                  </label>
                  <select
                    name="genderCategory"
                    value={formData.genderCategory}
                    onChange={handleInputChange}
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  >
                    {Object.values(GenderCategory).map(gender => (
                      <option key={gender} value={gender}>{gender}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2.5 block font-medium text-black dark:text-white">
                    Design Color
                  </label>
                  <select
                    name="designColor"
                    value={formData.designColor}
                    onChange={handleInputChange}
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  >
                    {Object.values(DesignColor).map(color => (
                      <option key={color} value={color}>{color}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2.5 block font-medium text-black dark:text-white">
                    Upload Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  />
                </div>

                <button
                  type="submit"
                  className="flex w-full justify-center rounded bg-primary p-3 font-medium text-white hover:bg-opacity-90"
                >
                  Create Mockup
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AddMockupPage; 