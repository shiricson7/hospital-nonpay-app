import React, { useState, useEffect } from 'react';
import { Printer, Plus, Trash2, Settings } from 'lucide-react';

const initialCategories = {
  수액제제: [
    { id: 1, name: '해열제', price: 30000 },
    { id: 2, name: '비타민 영양제(소)', price: 35000 },
    { id: 3, name: '비타민 영양제(대)', price: 40000 },
    { id: 4, name: '아미노산+비타민 영양제', price: 50000 },
    { id: 5, name: '아미노산+디팹티벤', price: 70000 },
    { id: 6, name: '마이어스 칵테일', price: 80000 },
    { id: 7, name: '복합영양제 (위너프페리)', price: 100000 },
    { id: 8, name: '페라미플루', price: 80000 }
  ],
  검사: [
    { id: 9, name: '독감, 코로나', price: 40000 },
    { id: 10, name: '독감', price: 30000 },
    { id: 11, name: '코로나', price: 20000 },
    { id: 12, name: '호흡기바이러스 3종', price: 40000 },
    { id: 13, name: '독감 PCR', price: 60000 },
    { id: 14, name: '호흡기바이러스 PCR', price: 100000 }
  ],
  치료재료: [
    { id: 15, name: '도지플로', price: 4000 },
    { id: 16, name: '밴드골드 수액고정 반창고', price: 1000 }
  ]
};

export default function HospitalNonPayApp() {
  const [categories, setCategories] = useState(initialCategories);
  const [selectedItems, setSelectedItems] = useState([]);
  const [isManageMode, setIsManageMode] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [newItem, setNewItem] = useState({ name: '', price: '' });
  const [addingToCategory, setAddingToCategory] = useState(null);
  const [loadedFromStorage, setLoadedFromStorage] = useState(false);

  // 로컬 저장된 카테고리 불러오기
  useEffect(() => {
    try {
      const stored = localStorage.getItem('nonpay-categories');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') {
          setCategories(parsed);
        }
      }
    } catch (e) {
      console.warn('Failed to load saved categories', e);
    }
    setLoadedFromStorage(true);
  }, []);

  // 변경된 카테고리 저장
  useEffect(() => {
    if (!loadedFromStorage) return;
    try {
      localStorage.setItem('nonpay-categories', JSON.stringify(categories));
    } catch (e) {
      console.warn('Failed to save categories', e);
    }
  }, [categories, loadedFromStorage]);

  const toggleItem = (category, item) => {
    const itemWithCategory = { ...item, category };
    const isSelected = selectedItems.some((i) => i.id === item.id);

    if (isSelected) {
      setSelectedItems(selectedItems.filter((i) => i.id !== item.id));
    } else {
      setSelectedItems([...selectedItems, itemWithCategory]);
    }
  };

  const totalPrice = selectedItems.reduce((sum, item) => sum + item.price, 0);
  const selectedNames = selectedItems.map((item) => item.name).join(', ');
  const printTitle =
    selectedItems.length > 0
      ? `오늘 치료받은 비급여 목록입니다 ${selectedNames} 총 ${totalPrice.toLocaleString()}원입니다.`
      : '오늘 치료받은 비급여 목록입니다 항목을 선택해 주세요.';

  const addCategory = () => {
    if (newCategory.trim() && !categories[newCategory]) {
      setCategories({ ...categories, [newCategory]: [] });
      setNewCategory('');
    }
  };

  const deleteCategory = (categoryName) => {
    const newCategories = { ...categories };
    delete newCategories[categoryName];
    setCategories(newCategories);
    setSelectedItems(selectedItems.filter((item) => item.category !== categoryName));
  };

  const addItem = (categoryName) => {
    if (newItem.name.trim() && newItem.price) {
      const newId = Math.max(...Object.values(categories).flat().map((i) => i.id), 0) + 1;
      const item = {
        id: newId,
        name: newItem.name,
        price: parseInt(newItem.price, 10)
      };

      setCategories({
        ...categories,
        [categoryName]: [...categories[categoryName], item]
      });

      setNewItem({ name: '', price: '' });
      setAddingToCategory(null);
    }
  };

  const deleteItem = (categoryName, itemId) => {
    setCategories({
      ...categories,
      [categoryName]: categories[categoryName].filter((item) => item.id !== itemId)
    });
    setSelectedItems(selectedItems.filter((item) => item.id !== itemId));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/* 출력 전용 스타일 */}
      <style>{`
        @media print {
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          @page {
            size: 100mm 100mm;
            margin: 0;
          }

          html, body {
            width: 100mm;
            height: 100mm;
            margin: 0;
            padding: 0;
          }

          .screen-only {
            display: none !important;
          }

          .print-area {
            display: block !important;
            width: 100mm !important;
            height: 100mm !important;
            padding: 6mm !important;
            font-family: 'Malgun Gothic', Arial, sans-serif !important;
            font-size: 10px !important;
            line-height: 1.3 !important;
            color: #000 !important;
            background: white !important;
          }
        }

        @media screen {
          .print-area {
            display: none;
          }
        }
      `}</style>

      {/* 화면용 영역 */}
      <div className="screen-only min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto mb-6">
          <div className="bg-white rounded-lg shadow p-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">병원 비급여 가격 안내</h1>
              <p className="text-sm text-gray-600 mt-1">선택 후 출력하면 100x100mm로 인쇄됩니다.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsManageMode(!isManageMode)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                <Settings size={20} />
                {isManageMode ? '선택 모드' : '관리 모드'}
              </button>
              {selectedItems.length > 0 && !isManageMode && (
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Printer size={20} />
                  출력
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {isManageMode && (
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="font-bold text-lg mb-3">카테고리 추가</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="새 카테고리 이름"
                    className="flex-1 px-3 py-2 border rounded-lg"
                  />
                  <button
                    onClick={addCategory}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    추가
                  </button>
                </div>
              </div>
            )}

            {Object.entries(categories).map(([categoryName, items]) => (
              <div key={categoryName} className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-lg text-blue-600">{categoryName}</h3>
                  {isManageMode && (
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          setAddingToCategory(addingToCategory === categoryName ? null : categoryName)
                        }
                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                      >
                        <Plus size={20} />
                      </button>
                      <button
                        onClick={() => deleteCategory(categoryName)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  )}
                </div>

                {isManageMode && addingToCategory === categoryName && (
                  <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={newItem.name}
                        onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                        placeholder="항목 이름"
                        className="flex-1 px-3 py-2 border rounded-lg"
                      />
                      <input
                        type="number"
                        value={newItem.price}
                        onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                        placeholder="가격"
                        className="w-32 px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <button
                      onClick={() => addItem(categoryName)}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      항목 추가
                    </button>
                  </div>
                )}

                <div className="space-y-2">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        {!isManageMode && (
                          <input
                            type="checkbox"
                            checked={selectedItems.some((i) => i.id === item.id)}
                            onChange={() => toggleItem(categoryName, item)}
                            className="w-5 h-5"
                          />
                        )}
                        <span className="font-medium">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">{item.price.toLocaleString()}원</span>
                        {isManageMode && (
                          <button
                            onClick={() => deleteItem(categoryName, item.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {!isManageMode && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-4 sticky top-4">
                <h3 className="font-bold text-lg mb-4">선택한 항목</h3>

                {selectedItems.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">항목을 선택해 주세요</p>
                ) : (
                  <>
                    <div className="space-y-2 mb-4 max-h-96 overflow-y-auto">
                      {selectedItems.map((item) => (
                        <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span className="text-sm">{item.name}</span>
                          <span className="text-sm font-medium">{item.price.toLocaleString()}원</span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center text-xl font-bold">
                        <span>총액</span>
                        <span className="text-blue-600">{totalPrice.toLocaleString()}원</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 출력용 100x100mm 영역 */}
      <div className="print-area">
        <div
          style={{
            fontSize: '12px',
            fontWeight: 'bold',
            lineHeight: 1.4,
            marginBottom: '8px'
          }}
        >
          {printTitle}
        </div>

        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            marginTop: '4px'
          }}
        >
          <thead>
            <tr>
              <th
                style={{
                  borderBottom: '1px solid #000',
                  padding: '3px 0',
                  textAlign: 'left',
                  fontSize: '11px'
                }}
              >
                항목
              </th>
              <th
                style={{
                  borderBottom: '1px solid #000',
                  padding: '3px 0',
                  textAlign: 'right',
                  fontSize: '11px'
                }}
              >
                금액
              </th>
            </tr>
          </thead>
          <tbody>
            {selectedItems.map((item) => (
              <tr key={item.id}>
                <td
                  style={{
                    borderBottom: '1px solid #ddd',
                    padding: '3px 0',
                    fontSize: '10px'
                  }}
                >
                  {item.name}
                </td>
                <td
                  style={{
                    borderBottom: '1px solid #ddd',
                    padding: '3px 0',
                    textAlign: 'right',
                    fontSize: '10px'
                  }}
                >
                  {item.price.toLocaleString()}원
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div
          style={{
            marginTop: '8px',
            paddingTop: '6px',
            borderTop: '2px solid #000',
            display: 'flex',
            justifyContent: 'space-between',
            fontWeight: 'bold',
            fontSize: '12px'
          }}
        >
          <span>총액</span>
          <span>{totalPrice.toLocaleString()}원</span>
        </div>

        <div
          style={{
            marginTop: '10px',
            paddingTop: '6px',
            borderTop: '1px solid #ccc',
            fontSize: '8px',
            textAlign: 'center',
            color: '#666'
          }}
        >
          비급여 항목은 건강보험이 적용되지 않는 비용입니다.
        </div>
      </div>
    </>
  );
}
