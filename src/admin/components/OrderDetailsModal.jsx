import React from 'react';
import Modal from './Modal';

export default function OrderDetailsModal({
  isOpen,
  onClose,
  order
}) {
  if (!order) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Order Details: ${order.id}`} maxWidth="max-w-3xl">
      <div className="space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#FAF6F0] border border-stone-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">Placed on</span>
              <span className="text-sm font-medium text-stone-800">{order.orderDate}</span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Order ID: <span className="font-mono text-stone-700 font-medium">{order.id}</span>
            </p>
          </div>
        </div>

        {/* Customer & Delivery Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Customer Information */}
          <div className="p-4 rounded-xl border border-stone-200 bg-white">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-3">
              Customer Information
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-stone-500">Name:</span>
                <span className="font-medium text-stone-900">{order.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Phone:</span>
                <span className="font-medium text-stone-900">{order.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Email:</span>
                <span className="font-medium text-stone-900">{order.email}</span>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="p-4 rounded-xl border border-stone-200 bg-white">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-3">
              Delivery Address
            </h4>
            <div className="text-sm text-stone-700 leading-relaxed">
              <p className="font-medium text-stone-900">{order.customerName}</p>
              <p>{order.deliveryAddress?.street}</p>
              <p>
                {order.deliveryAddress?.city}, {order.deliveryAddress?.state}
              </p>
              <p className="mt-1 font-medium text-stone-900">
                Pincode: <span className="text-[#3a4d39] font-mono">{order.deliveryAddress?.pincode || order.deliveryAddress?.postalCode}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Ordered Products Table */}
        <div className="border border-stone-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 bg-[#FAF6F0] border-b border-stone-200">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-600">
              Ordered Products
            </h4>
          </div>
          <div className="divide-y divide-stone-100">
            {(order.items || []).map((item, idx) => (
              <div key={idx} className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 rounded-lg object-cover border border-stone-200 bg-stone-50"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/assets/images/img1.jpeg';
                    }}
                  />
                  <div>
                    <h5 className="text-sm font-medium text-stone-900">{item.name}</h5>
                    <p className="text-xs text-stone-500">Weight: {item.weight || 'Standard'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-stone-500">
                    {item.quantity} × ₹{item.price}
                  </p>
                  <p className="text-sm font-semibold text-stone-900">
                    ₹{((Number(item.quantity) || 0) * (Number(item.price) || 0)).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Summary */}
        <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-sm space-y-2">
          <div className="flex justify-between text-stone-600">
            <span>Subtotal</span>
            <span>₹{Number(order.subtotal || 0).toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between text-stone-600">
            <span>Shipping Charge</span>
            <span>{Number(order.shippingCharge || 0) === 0 ? 'FREE' : `₹${order.shippingCharge}`}</span>
          </div>
          <div className="pt-2 border-t border-stone-200 flex justify-between font-bold text-base text-[#2e2a26]">
            <span>Total Amount</span>
            <span className="text-[#3a4d39]">₹{Number(order.totalAmount || 0).toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg bg-[#3a4d39] text-white text-sm font-medium hover:bg-[#2d3d2c] transition-colors"
          >
            Close Details
          </button>
        </div>
      </div>
    </Modal>
  );
}
