/**
 * NEUROWELL - Stripe Integration Module
 * Handles Stripe payment link redirection and backend communication
 */

const StripeManager = {
    // API base URL - update this to your actual backend URL in production
    API_BASE_URL: 'http://127.0.0.1:8000',

    /**
     * Redirect user to Stripe Checkout
     * Fetches the payment link from the backend
     */
    redirectToCheckout: async () => {
        try {
            console.log('💳 Initiating Stripe Checkout...');
            
            // Show loader if available
            if (window.AppManager && window.AppManager.showLoader) {
                AppManager.showLoader('Connecting to Stripe...', 'Preparing your secure checkout');
            }

            // Fetch the payment link from our backend
            const response = await fetch(`${StripeManager.API_BASE_URL}/get-stripe-link`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch Stripe link from backend');
            }

            const data = await response.json();
            
            if (data && data.url) {
                console.log('✅ Redirecting to:', data.url);
                window.location.href = data.url;
            } else {
                throw new Error('Invalid response from backend: missing URL');
            }

        } catch (error) {
            console.error('❌ Stripe Redirection Error:', error);
            
            // Hide loader and show error
            if (window.AppManager && window.AppManager.hideLoader) {
                AppManager.hideLoader();
                AppManager.showNotification('Payment service is currently unavailable. Please try again later.', 'error');
            } else {
                alert('Payment service is currently unavailable. Please try again later.');
            }
        }
    },

    /**
     * Initialize Stripe triggers in the UI
     * Finds all elements with data-stripe="checkout" and attaches click event
     */
    init: () => {
        console.log('🎯 Initializing Stripe Triggers...');
        
        document.addEventListener('click', (e) => {
            if (e.target.closest('[data-stripe="checkout"]')) {
                e.preventDefault();
                StripeManager.redirectToCheckout();
            }
        });
    }
};

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', StripeManager.init);
} else {
    StripeManager.init();
}
