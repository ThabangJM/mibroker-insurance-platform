import { useState, useEffect } from 'react';
import { Search, Plus, Minus, Trash2, ShoppingCart, CreditCard, Banknote, Smartphone } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useStore } from '../contexts/StoreContext';
import { useAuth } from '../contexts/AuthContext';
import type { Database } from '../lib/database.types';

type Product = Database['public']['Tables']['products']['Row'] & {
  inventory?: { quantity: number };
};

interface CartItem extends Product {
  cartQuantity: number;
}

export function POSPage() {
  const { currentStore } = useStore();
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  useEffect(() => {
    if (currentStore) {
      fetchProducts();
    }
  }, [currentStore]);

  const fetchProducts = async () => {
    if (!currentStore) return;

    const { data } = await supabase
      .from('products')
      .select(`
        *,
        inventory (quantity)
      `)
      .eq('store_id', currentStore.id)
      .eq('is_active', true)
      .order('name');

    if (data) {
      setProducts(data);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (product.barcode && product.barcode.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.id === product.id);
    const availableQty = product.inventory?.quantity || 0;

    if (existingItem) {
      if (existingItem.cartQuantity < availableQty) {
        setCart(cart.map(item =>
          item.id === product.id
            ? { ...item, cartQuantity: item.cartQuantity + 1 }
            : item
        ));
      }
    } else {
      if (availableQty > 0) {
        setCart([...cart, { ...product, cartQuantity: 1 }]);
      }
    }
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    const product = products.find(p => p.id === productId);
    const maxQty = product?.inventory?.quantity || 0;

    if (newQuantity <= 0) {
      setCart(cart.filter(item => item.id !== productId));
    } else if (newQuantity <= maxQty) {
      setCart(cart.map(item =>
        item.id === productId ? { ...item, cartQuantity: newQuantity } : item
      ));
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.cartQuantity), 0);
  const taxRate = (currentStore?.settings as any)?.tax_rate || 15;
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;

  return (
    <div className="h-screen flex">
      <div className="flex-1 p-6 overflow-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Point of Sale</h1>
          <p className="text-gray-600">Select products to add to cart</p>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, SKU, or barcode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map(product => {
            const inStock = (product.inventory?.quantity || 0) > 0;
            const cartItem = cart.find(item => item.id === product.id);

            return (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                disabled={!inStock}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  inStock
                    ? 'border-gray-200 hover:border-blue-500 hover:shadow-md'
                    : 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 line-clamp-2">{product.name}</h3>
                  {cartItem && (
                    <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                      {cartItem.cartQuantity}
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-600 mb-2">{product.sku}</div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-900">
                    R {product.price.toFixed(2)}
                  </span>
                  <span className={`text-sm ${inStock ? 'text-green-600' : 'text-red-600'}`}>
                    Stock: {product.inventory?.quantity || 0}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <ShoppingCart className="w-6 h-6 text-gray-700" />
            <h2 className="text-2xl font-bold text-gray-900">Cart</h2>
          </div>
          <p className="text-sm text-gray-600">{cart.length} items</p>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {cart.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>Cart is empty</p>
              <p className="text-sm mt-1">Add products to start a sale</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map(item => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-600">R {item.price.toFixed(2)} each</p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-600 hover:bg-red-50 p-1 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.cartQuantity - 1)}
                        className="p-1 rounded border border-gray-300 hover:bg-gray-50"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-12 text-center font-medium">{item.cartQuantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.cartQuantity + 1)}
                        className="p-1 rounded border border-gray-300 hover:bg-gray-50"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="font-bold text-gray-900">
                      R {(item.price * item.cartQuantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 p-6">
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>R {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Tax ({taxRate}%)</span>
              <span>R {taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t border-gray-200">
              <span>Total</span>
              <span>R {total.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={() => setShowCheckout(true)}
            disabled={cart.length === 0}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
          >
            Checkout
          </button>
        </div>
      </div>

      {showCheckout && (
        <CheckoutModal
          cart={cart}
          subtotal={subtotal}
          taxAmount={taxAmount}
          total={total}
          onClose={() => setShowCheckout(false)}
          onComplete={() => {
            setCart([]);
            setShowCheckout(false);
            fetchProducts();
          }}
        />
      )}
    </div>
  );
}

interface CheckoutModalProps {
  cart: CartItem[];
  subtotal: number;
  taxAmount: number;
  total: number;
  onClose: () => void;
  onComplete: () => void;
}

function CheckoutModal({ cart, subtotal, taxAmount, total, onClose, onComplete }: CheckoutModalProps) {
  const { currentStore } = useStore();
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Card' | 'Mobile'>('Cash');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePayment = async () => {
    if (!currentStore || !user) return;

    setLoading(true);
    setError('');

    try {
      const transactionNumber = `TXN-${Date.now()}`;

      const { data: transaction, error: txError } = await supabase
        .from('transactions')
        .insert({
          store_id: currentStore.id,
          cashier_id: user.id,
          transaction_number: transactionNumber,
          subtotal,
          tax_amount: taxAmount,
          discount_amount: 0,
          total_amount: total,
          payment_method: paymentMethod,
          payment_status: 'Completed',
        })
        .select()
        .single();

      if (txError) throw txError;

      const items = cart.map(item => ({
        transaction_id: transaction.id,
        product_id: item.id,
        quantity: item.cartQuantity,
        unit_price: item.price,
        discount: 0,
        total: item.price * item.cartQuantity,
      }));

      const { error: itemsError } = await supabase
        .from('transaction_items')
        .insert(items);

      if (itemsError) throw itemsError;

      for (const item of cart) {
        const { error: invError } = await supabase.rpc('decrement_inventory', {
          product_id: item.id,
          quantity: item.cartQuantity,
        });

        if (!invError) {
          await supabase
            .from('inventory')
            .update({
              quantity: (item.inventory?.quantity || 0) - item.cartQuantity,
            })
            .eq('product_id', item.id);
        }
      }

      onComplete();
    } catch (err: any) {
      setError(err.message || 'Failed to process payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Complete Payment</h2>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex justify-between text-gray-600 mb-2">
              <span>Subtotal</span>
              <span>R {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600 mb-2">
              <span>Tax</span>
              <span>R {taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-2xl font-bold text-gray-900 pt-2 border-t border-gray-300">
              <span>Total</span>
              <span>R {total.toFixed(2)}</span>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Payment Method
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setPaymentMethod('Cash')}
                className={`p-4 rounded-lg border-2 flex flex-col items-center gap-2 ${
                  paymentMethod === 'Cash'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Banknote className="w-6 h-6" />
                <span className="text-sm font-medium">Cash</span>
              </button>
              <button
                onClick={() => setPaymentMethod('Card')}
                className={`p-4 rounded-lg border-2 flex flex-col items-center gap-2 ${
                  paymentMethod === 'Card'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <CreditCard className="w-6 h-6" />
                <span className="text-sm font-medium">Card</span>
              </button>
              <button
                onClick={() => setPaymentMethod('Mobile')}
                className={`p-4 rounded-lg border-2 flex flex-col items-center gap-2 ${
                  paymentMethod === 'Mobile'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Smartphone className="w-6 h-6" />
                <span className="text-sm font-medium">Mobile</span>
              </button>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handlePayment}
              disabled={loading}
              className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Processing...' : 'Complete Sale'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
