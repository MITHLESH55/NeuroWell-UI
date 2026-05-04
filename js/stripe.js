/**
 * NEUROWELL - Stripe Integration Module
 * Handles Stripe payment link redirection and backend communication
 */

const StripeManager = {
    // API base URL - replace with your deployed backend URL for production
    // Use localhost when testing locally with backend running on 127.0.0.1:8000
    API_BASE_URL: 'http://127.0.0.1:8000',

    /**
     * Redirect user to Stripe Checkout
     * Fetches the payment link from the backend
     */
    redirectToCheckout: async () => {
        try {
            console.log('💳 Initiating Stripe Checkout...');

            if (window.AppManager && window.AppManager.showLoader) {
                AppManager.showLoader('Connecting to Stripe...', 'Preparing your secure checkout');
            }

            const response = await fetch(`${StripeManager.API_BASE_URL}/create-checkout-session`, {
                method: 'POST'
            });

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

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', StripeManager.init);
} else {
    StripeManager.init();
}
