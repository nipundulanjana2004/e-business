import React, { useState, useEffect, useRef } from 'react';
import { useShop } from '../context/ShopContext';
import { X, Plus, Shield, Trash2, Upload, Check, AlertTriangle } from 'lucide-react';
import { createProduct, updateProduct, deleteProduct, fetchOrders, updateOrderStatus } from '../services/api';

export const AdminDashboard = () => {
  const { isAdminOpen, setIsAdminOpen, products, loadData, token, addToast } = useShop();
  const [activeTab, setActiveTab] = useState('products');
  const [orders, setOrders] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [uploadType, setUploadType] = useState('file');
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);

  const standardSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  const [newProduct, setNewProduct] = useState({
    name: '',
    title: '',
    subtitle: '',
    category: 'women',
    price: 4500,
    originalPrice: 5500,
    stock: 25,
    sizes: ['S', 'M', 'L', 'XL'],
    isNewArrival: true,
    image: '',
    description: 'Bespoke high fashion garment crafted in limited atelier quantities.'
  });

  useEffect(() => {
    if (isAdminOpen) {
      fetchOrders(token).then(res => {
        if (res.success) setOrders(res.orders);
      });
    }
  }, [isAdminOpen, token]);

  if (!isAdminOpen) return null;

  const totalRevenue = orders.reduce((acc, o) => acc + (o.totalPrice || 0), 0);
  const totalStockUnits = products.reduce((acc, p) => acc + (Number(p.stock) || 0), 0);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        addToast('Please choose an image smaller than 10MB', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Data = reader.result;
        setPreviewImage(base64Data);
        setNewProduct(prev => ({ ...prev, image: base64Data }));
        addToast('Image loaded successfully!', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleSizeSelection = (sz) => {
    setNewProduct(prev => {
      const current = prev.sizes || [];
      const updated = current.includes(sz)
        ? current.filter(s => s !== sz)
        : [...current, sz];
      return { ...prev, sizes: updated.length > 0 ? updated : ['M'] };
    });
  };

  const handleQuickStockUpdate = async (productId, delta) => {
    const prod = products.find(p => (p.id || p._id) === productId);
    if (!prod) return;
    const currentStock = Number(prod.stock) || 0;
    const newStock = Math.max(0, currentStock + delta);

    const res = await updateProduct(productId, { stock: newStock }, token);
    if (res.success) {
      addToast(`Updated stock for "${prod.name}" to ${newStock} units`, 'info');
      loadData();
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.image) {
      addToast('Please upload or provide an image for the garment', 'error');
      return;
    }

    const payload = {
      ...newProduct,
      stock: Number(newProduct.stock) || 1,
      price: Number(newProduct.price) || 1000
    };

    const res = await createProduct(payload, token);
    if (res.success) {
      addToast(`Listed "${newProduct.name}" with ${payload.stock} available units!`, 'success');
      setShowAddModal(false);
      setPreviewImage(null);
      setNewProduct({
        name: '',
        title: '',
        subtitle: '',
        category: 'women',
        price: 4500,
        originalPrice: 5500,
        stock: 25,
        sizes: ['S', 'M', 'L', 'XL'],
        isNewArrival: true,
        image: '',
        description: 'Bespoke high fashion garment crafted in limited atelier quantities.'
      });
      loadData();
    } else {
      addToast('Error listing product', 'error');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Delete this garment from catalog?')) {
      const res = await deleteProduct(id, token);
      if (res.success) {
        addToast('Garment deleted from catalog', 'info');
        loadData();
      }
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    const res = await updateOrderStatus(orderId, newStatus, token);
    if (res.success) {
      setOrders(orders.map(o => (o._id === orderId || o.id === orderId) ? { ...o, status: newStatus } : o));
      addToast(`Order status updated to ${newStatus}`, 'success');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative bg-white w-full max-w-5xl border border-neutral-200 shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-6 bg-[#0e0f12] text-white flex items-center justify-between border-b border-neutral-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-amber-500 text-black flex items-center justify-center font-bold">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black uppercase tracking-wider">
                DRESSFEAT Atelier Inventory &amp; Listing Management
              </h2>
              <span className="text-[10px] text-neutral-400 uppercase tracking-widest">
                Administrator Stock Control Console MMXXVI
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsAdminOpen(false)}
            className="p-1.5 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats KPIs */}
        <div className="grid grid-cols-4 gap-3 p-5 bg-neutral-50 border-b border-neutral-200">
          <div className="bg-white p-3.5 border border-neutral-200 shadow-sm">
            <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 block">Total Revenue</span>
            <span className="text-lg font-extrabold text-neutral-900">
              Rs. {totalRevenue.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="bg-white p-3.5 border border-neutral-200 shadow-sm">
            <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 block">Total In-Stock Units</span>
            <span className="text-lg font-extrabold text-emerald-700">{totalStockUnits} units</span>
          </div>
          <div className="bg-white p-3.5 border border-neutral-200 shadow-sm">
            <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 block">Garment Models</span>
            <span className="text-lg font-extrabold text-neutral-900">{products.length} styles</span>
          </div>
          <div className="bg-white p-3.5 border border-neutral-200 shadow-sm">
            <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 block">Active Orders</span>
            <span className="text-lg font-extrabold text-neutral-900">{orders.length}</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-neutral-200 px-6 bg-white justify-between items-center">
          <div className="flex space-x-6 text-xs font-bold uppercase tracking-wider">
            <button
              onClick={() => setActiveTab('products')}
              className={`py-3 border-b-2 ${activeTab === 'products' ? 'border-black text-black' : 'border-transparent text-neutral-400'}`}
            >
              Catalog &amp; Available Quantities ({products.length})
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`py-3 border-b-2 ${activeTab === 'orders' ? 'border-black text-black' : 'border-transparent text-neutral-400'}`}
            >
              Customer Orders ({orders.length})
            </button>
          </div>

          {activeTab === 'products' && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-black text-white text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 hover:bg-neutral-800"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>List New Garment with Stock</span>
            </button>
          )}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'products' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-neutral-200 text-neutral-500 uppercase tracking-wider">
                    <th className="py-2.5 font-bold">Item &amp; Details</th>
                    <th className="py-2.5 font-bold">Category</th>
                    <th className="py-2.5 font-bold">Price</th>
                    <th className="py-2.5 font-bold">Available Quantity</th>
                    <th className="py-2.5 font-bold text-center">Quick Stock Adjust</th>
                    <th className="py-2.5 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {products.map((p) => {
                    const stock = Number(p.stock) || 0;
                    return (
                      <tr key={p.id || p._id} className="hover:bg-neutral-50">
                        <td className="py-3 flex items-center space-x-3">
                          <img src={p.image} alt="" className="w-10 h-12 object-cover border" />
                          <div>
                            <p className="font-bold text-neutral-900">{p.name}</p>
                            <p className="text-[10px] text-neutral-400">{p.subtitle || 'Atelier Collection'}</p>
                          </div>
                        </td>
                        <td className="py-3 uppercase font-semibold text-neutral-700">{p.category}</td>
                        <td className="py-3 font-bold text-neutral-900">Rs. {Number(p.price).toLocaleString('en-IN')}</td>
                        
                        {/* Stock Pill Status */}
                        <td className="py-3">
                          {stock > 5 ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
                              <Check className="w-3 h-3 mr-1" /> In Stock ({stock} units)
                            </span>
                          ) : stock > 0 ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800">
                              <AlertTriangle className="w-3 h-3 mr-1" /> Low Stock ({stock} left)
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-800">
                              Sold Out (0 units)
                            </span>
                          )}
                        </td>

                        {/* Quick Stock Adjust Stepper */}
                        <td className="py-3 text-center">
                          <div className="inline-flex items-center border border-neutral-300 bg-white">
                            <button
                              onClick={() => handleQuickStockUpdate(p.id || p._id, -5)}
                              className="px-2 py-1 text-[10px] font-bold hover:bg-neutral-100 border-r"
                              title="Decrease 5 units"
                            >
                              -5
                            </button>
                            <button
                              onClick={() => handleQuickStockUpdate(p.id || p._id, -1)}
                              className="px-2 py-1 text-xs font-bold hover:bg-neutral-100 border-r"
                              title="Decrease 1 unit"
                            >
                              -
                            </button>
                            <span className="px-2.5 font-extrabold text-xs min-w-[28px]">
                              {stock}
                            </span>
                            <button
                              onClick={() => handleQuickStockUpdate(p.id || p._id, 1)}
                              className="px-2 py-1 text-xs font-bold hover:bg-neutral-100 border-l"
                              title="Increase 1 unit"
                            >
                              +
                            </button>
                            <button
                              onClick={() => handleQuickStockUpdate(p.id || p._id, 5)}
                              className="px-2 py-1 text-[10px] font-bold hover:bg-neutral-100 border-l"
                              title="Add 5 units"
                            >
                              +5
                            </button>
                          </div>
                        </td>

                        <td className="py-3 text-right">
                          <button
                            onClick={() => handleDeleteProduct(p.id || p._id)}
                            className="p-1.5 text-neutral-400 hover:text-red-600"
                            title="Delete Garment"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.length === 0 ? (
                <p className="text-neutral-500 text-xs text-center py-8">No customer orders placed yet.</p>
              ) : (
                orders.map((ord) => (
                  <div key={ord._id || ord.id} className="p-4 border border-neutral-200 bg-white space-y-3">
                    <div className="flex justify-between items-center text-xs pb-2 border-b border-neutral-100">
                      <div>
                        <span className="font-mono font-bold text-neutral-900">{ord.trackingNumber || ord._id}</span>
                        <span className="text-neutral-400 ml-2">Customer: <strong>{ord.user?.name || ord.shippingAddress?.fullName}</strong></span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-neutral-100">
                          {ord.paymentMethod} • {ord.paymentStatus}
                        </span>
                        <select
                          value={ord.status || 'Processing'}
                          onChange={(e) => handleStatusChange(ord._id || ord.id, e.target.value)}
                          className="text-xs font-bold border border-neutral-300 px-2 py-1 bg-white"
                        >
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-between text-xs text-neutral-600">
                      <div>
                        {ord.orderItems?.map((it, i) => (
                          <p key={i}>• {it.qty}x {it.name} ({it.size || 'M'}) — Rs. {it.price}</p>
                        ))}
                      </div>
                      <div className="text-right font-bold text-neutral-900">
                        Total: Rs. {Number(ord.totalPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Add Product Modal with Available Quantity & Local Upload */}
        {showAddModal && (
          <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white p-6 w-full max-w-lg border border-neutral-300 shadow-2xl space-y-4 text-xs max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b pb-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600 block">Catalog Management</span>
                  <h3 className="font-extrabold uppercase text-sm text-neutral-900">List Garment &amp; Set Available Quantity</h3>
                </div>
                <button onClick={() => setShowAddModal(false)}><X className="w-4 h-4" /></button>
              </div>

              <form onSubmit={handleCreateProduct} className="space-y-4">
                <div>
                  <label className="font-bold block mb-1 text-neutral-700">Garment Title *</label>
                  <input
                    type="text"
                    required
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value, title: e.target.value })}
                    placeholder="e.g. Imperial Silk Utility Trench"
                    className="w-full p-2.5 border border-neutral-300 focus:outline-none focus:border-black font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1 text-neutral-700">Subtitle / Material Spec</label>
                  <input
                    type="text"
                    value={newProduct.subtitle}
                    onChange={(e) => setNewProduct({ ...newProduct, subtitle: e.target.value })}
                    placeholder="e.g. 100% Washed Mulberry Silk • Mother of Pearl Buttons"
                    className="w-full p-2.5 border border-neutral-300 focus:outline-none focus:border-black"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold block mb-1 text-neutral-700">Category *</label>
                    <select
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                      className="w-full p-2.5 border border-neutral-300 focus:outline-none focus:border-black bg-white font-medium"
                    >
                      <option value="women">Women</option>
                      <option value="men">Men</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold block mb-1 text-neutral-700">Price (Rs.) *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                      className="w-full p-2.5 border border-neutral-300 focus:outline-none focus:border-black font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-bold block mb-1 text-emerald-800 bg-emerald-50 px-1 py-0.5 rounded">
                      Available Quantity *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={newProduct.stock}
                      onChange={(e) => setNewProduct({ ...newProduct, stock: Number(e.target.value) })}
                      placeholder="e.g. 25"
                      className="w-full p-2.5 border-2 border-emerald-500 focus:outline-none focus:border-black font-extrabold bg-emerald-50/30"
                    />
                  </div>
                </div>

                {/* Available Sizes Picker */}
                <div>
                  <label className="font-bold block mb-1 text-neutral-700">
                    Available Sizes for Listing:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {standardSizes.map((sz) => {
                      const isSelected = (newProduct.sizes || []).includes(sz);
                      return (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => toggleSizeSelection(sz)}
                          className={`px-3 py-1.5 border font-bold text-xs transition-all ${
                            isSelected
                              ? 'bg-black text-white border-black'
                              : 'bg-neutral-100 text-neutral-600 border-neutral-200 hover:border-neutral-400'
                          }`}
                        >
                          {sz} {isSelected && '✓'}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Product Image Section */}
                <div className="space-y-2 pt-1 border-t border-neutral-100">
                  <div className="flex justify-between items-center">
                    <label className="font-bold text-neutral-800">Garment Image *</label>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => setUploadType('file')}
                        className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${uploadType === 'file' ? 'bg-black text-white' : 'bg-neutral-100 text-neutral-600'}`}
                      >
                        Upload from Device
                      </button>
                      <button
                        type="button"
                        onClick={() => setUploadType('url')}
                        className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${uploadType === 'url' ? 'bg-black text-white' : 'bg-neutral-100 text-neutral-600'}`}
                      >
                        Web Link
                      </button>
                    </div>
                  </div>

                  {uploadType === 'file' ? (
                    <div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />

                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-neutral-300 hover:border-black bg-neutral-50 hover:bg-neutral-100 p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-2"
                      >
                        {previewImage ? (
                          <div className="flex flex-col items-center space-y-2">
                            <img
                              src={previewImage}
                              alt="Garment Preview"
                              className="w-20 h-24 object-cover border border-neutral-300 shadow-md"
                            />
                            <span className="text-[11px] font-bold text-emerald-700 flex items-center">
                              <Check className="w-3.5 h-3.5 mr-1" /> Image Selected (Click to change)
                            </span>
                          </div>
                        ) : (
                          <>
                            <Upload className="w-6 h-6 text-neutral-400" />
                            <span className="font-bold text-neutral-800 text-xs">
                              Click to choose image file from your PC
                            </span>
                            <span className="text-[10px] text-neutral-500">
                              Supports JPG, PNG, WEBP
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/..."
                        value={newProduct.image}
                        onChange={(e) => {
                          setNewProduct({ ...newProduct, image: e.target.value });
                          setPreviewImage(e.target.value);
                        }}
                        className="w-full p-2.5 border border-neutral-300 focus:outline-none focus:border-black"
                      />
                      {previewImage && (
                        <div className="mt-2">
                          <img src={previewImage} alt="Preview" className="w-16 h-20 object-cover border" />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="font-bold block mb-1 text-neutral-700">Description</label>
                  <textarea
                    rows={2}
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    className="w-full p-2.5 border border-neutral-300 focus:outline-none focus:border-black"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-2 border-t border-neutral-100">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border text-neutral-600 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-black text-white font-bold uppercase tracking-wider hover:bg-neutral-800"
                  >
                    List Garment ({newProduct.stock} Units)
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
