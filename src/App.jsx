import React, { useState } from 'react';

// 이모지 아이콘 컴포넌트
const Printer = () => <span style={{ fontSize: '20px' }}>🖨️</span>;
const Plus = () => <span style={{ fontSize: '18px' }}>➕</span>;
const Trash2 = () => <span style={{ fontSize: '18px' }}>🗑️</span>;
const Settings = () => <span style={{ fontSize: '20px' }}>⚙️</span>;

export default function HospitalNonPayApp() {
  const [categories, setCategories] = useState({
    '검사': [
      { id: 1, name: '독감 검사', price: 30000 },
      { id: 2, name: '코로나 검사', price: 20000 },
      { id: 3, name: '독감, 코로나 검사', price: 40000 },
      { id: 4, name: '독감 PCR 검사', price: 60000 },
      { id: 5, name: '호흡기바이러스 PCR검사', price: 100000 }
    ],
    '수액': [
      { id: 6, name: '해열제', price: 30000 },
      { id: 7, name: '어린이 비타민 영양제', price: 35000 },
      { id: 8, name: '필수 아미노산 영양제', price: 50000 },
      { id: 9, name: '항구토제', price: 17900 },
      { id: 10, name: '페라미플루', price: 80000 },
      { id: 11, name: '위너프페리 영양제', price: 100000 },
      { id: 12, name: '장점막회복 디펩티벤', price: 20000 },
      { id: 13, name: '칵테일수액', price: 80000 }
    ],
    '처치재료': [
      { id: 14, name: '도지플로', price: 3000 },
      { id: 15, name: '밴드골드 수액고정 스티커', price: 1000 }
    ]
  });

  const [selectedItems, setSelectedItems] = useState([]);
  const [isManageMode, setIsManageMode] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [newItem, setNewItem] = useState({ name: '', price: '' });
  const [addingToCategory, setAddingToCategory] = useState(null);

  const toggleItem = (category, item) => {
    const itemWithCategory = { ...item, category };
    const isSelected = selectedItems.some(i => i.id === item.id);
    
    if (isSelected) {
      setSelectedItems(selectedItems.filter(i => i.id !== item.id));
    } else {
      setSelectedItems([...selectedItems, itemWithCategory]);
    }
  };

  const totalPrice = selectedItems.reduce((sum, item) => sum + item.price, 0);

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
    setSelectedItems(selectedItems.filter(item => item.category !== categoryName));
  };

  const addItem = (categoryName) => {
    if (newItem.name.trim() && newItem.price) {
      const newId = Math.max(...Object.values(categories).flat().map(i => i.id), 0) + 1;
      const item = {
        id: newId,
        name: newItem.name,
        price: parseInt(newItem.price)
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
      [categoryName]: categories[categoryName].filter(item => item.id !== itemId)
    });
    setSelectedItems(selectedItems.filter(item => item.id !== itemId));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <style>{`
        @media print {
          @page {
            size: 100mm 100mm;
            margin: 0;
          }
          
          * {
            visibility: hidden !important;
          }
          
          #printArea,
          #printArea * {
            visibility: visible !important;
          }
          
          #printArea {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100mm !important;
            height: 100mm !important;
            padding: 5mm !important;
            background: white !important;
            display: block !important;
            page-break-after: avoid !important;
          }
          
          body {
            margin: 0 !important;
            padding: 0 !important;
          }
        }
        
        @media screen {
          #printArea {
            display: none;
          }
        }
      `}</style>

      <div className="max-w-6xl mx-auto mb-6 no-print">
        <div className="bg-white rounded-lg shadow p-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">병원 비급여 안내</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setIsManageMode(!isManageMode)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              <Settings />
              {isManageMode ? '선택 모드' : '관리 모드'}
            </button>
            {selectedItems.length > 0 && !isManageMode && (
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Printer />
                출력
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4 no-print">
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
                      onClick={() => setAddingToCategory(addingToCategory === categoryName ? null : categoryName)}
                      className="p-1 text-green-600 hover:bg-green-50 rounded"
                    >
                      <Plus />
                    </button>
                    <button
                      onClick={() => deleteCategory(categoryName)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 />
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
                      placeholder="제품명"
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
                    제품 추가
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
                          checked={selectedItems.some(i => i.id === item.id)}
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
                          <Trash2 />
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
              <h3 className="font-bold text-lg mb-4">선택된 항목</h3>
              
              {selectedItems.length === 0 ? (
                <p className="text-gray-500 text-center py-8">항목을 선택해주세요</p>
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

      <div id="printArea">
        <div style={{ fontSize: '11px', lineHeight: '1.3', fontFamily: 'Arial, sans-serif' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px', textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '5px' }}>
            비급여 항목 안내
          </h2>
          
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '8px', marginBottom: '8px' }}>
            <thead>
              <tr>
                <th style={{ borderBottom: '2px solid #000', padding: '4px 0', textAlign: 'left', fontSize: '12px', fontWeight: 'bold' }}>항목</th>
                <th style={{ borderBottom: '2px solid #000', padding: '4px 0', textAlign: 'right', fontSize: '12px', fontWeight: 'bold' }}>금액</th>
              </tr>
            </thead>
            <tbody>
              {selectedItems.map((item) => (
                <tr key={item.id}>
                  <td style={{ borderBottom: '1px solid #ccc', padding: '4px 0', fontSize: '11px' }}>{item.name}</td>
                  <td style={{ borderBottom: '1px solid #ccc', padding: '4px 0', textAlign: 'right', fontSize: '11px' }}>
                    {item.price.toLocaleString()}원
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '2px solid #000' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 'bold' }}>
              <span>총액:</span>
              <span>{totalPrice.toLocaleString()}원</span>
            </div>
          </div>
          
          <div style={{ marginTop: '12px', fontSize: '9px', color: '#666', textAlign: 'center', borderTop: '1px solid #ccc', paddingTop: '8px' }}>
            <p style={{ margin: 0 }}>본 항목은 건강보험이 적용되지 않는 비급여 항목입니다.</p>
            <p style={{ margin: '3px 0 0 0' }}>문의사항이 있으시면 접수처에 말씀해 주세요.</p>
          </div>
        </div>
      </div>
    </div>
  );
}