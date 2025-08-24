const Cart = require('../models/Cart');
const User = require('../models/User');
const Setting = require('../models/Setting');

const cartController = {
    
  getCart: async (req, res) => {
      try {
          const userId = req.session.user.id;
          const cartItems = await Cart.getByUser(userId);
          const addresses = await User.getAddresses(userId);
          const defaultAddress = addresses.find(a => a.is_default) || (addresses.length > 0 ? addresses[0] : null);

          // حساب المجموع
          let subtotal = 0;
          cartItems.forEach(item => {
              subtotal += item.price * item.quantity;
          });
        
          // حساب الرسوم الأخرى
          const settings = await Setting.getAll();
          const deliveryFee = parseFloat(settings.delivery_fee) || 0;
          const taxRate = parseFloat(settings.tax_rate) || 0;
          const tax = subtotal * taxRate;
          let discount = 0;
        
          // التحقق من وجود خصم في الجلسة
          if (req.session.discount) {
              discount = req.session.discount;
              req.session.discount = null; // مسح الخصم بعد استخدامه مرة واحدة
          }
        
          const total = subtotal + deliveryFee + tax - discount;
        
          res.render('user/cart', { 
              cartItems, 
              subtotal, 
              deliveryFee, 
              tax, 
              discount, 
              total,
              defaultAddress
          });
      } catch (err) {
          console.error(err);
          req.flash('error_msg', 'حدث خطأ أثناء تحميل سلة التسوق');
          res.redirect('/');
      }
  },


    addToCart: async (req, res) => {
        try {
            const userId = req.session.user.id;
            const { menu_item_id } = req.body;
            const quantity = parseInt(req.body.quantity, 10) || 1;

            if (isNaN(quantity) || quantity <= 0) {
                return res.status(400).json({ success: false, message: 'كمية غير صالحة' });
            }
            
            // التحقق من وجود العنصر في السلة
            const existingItem = await Cart.findByUserAndItem(userId, menu_item_id);
            
            if (existingItem) {
                // تحديث الكمية
                await Cart.update(existingItem.id, {
                    quantity: existingItem.quantity + quantity
                });
            } else {
                // إضافة عنصر جديد
                await Cart.create({
                    user_id: userId,
                    menu_item_id,
                    quantity
                });
            }
            
            res.json({ success: true });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: 'حدث خطأ أثناء إضافة العنصر إلى السلة' });
        }
    },

    updateCartItem: async (req, res) => {
        try {
            const cartItemId = req.params.id;
            const { quantity } = req.body;
            
            await Cart.update(cartItemId, { quantity });
            
            res.redirect('/cart');
        } catch (err) {
            console.error(err);
            res.status(500).send('حدث خطأ أثناء تحديث عنصر السلة');
        }
    },

    removeFromCart: async (req, res) => {
        try {
            const cartItemId = req.params.id;
            
            await Cart.delete(cartItemId);
            
            res.json({ success: true });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: 'حدث خطأ أثناء حذف عنصر من السلة' });
        }
    },

    clearCart: async (req, res) => {
        try {
            const userId = req.session.user.id;
            
            await Cart.clearByUser(userId);
            
            res.json({ success: true });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: 'حدث خطأ أثناء تفريغ السلة' });
        }
    }
};

module.exports = cartController;