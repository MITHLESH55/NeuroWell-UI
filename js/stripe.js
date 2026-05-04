/**
 * NeuroWell - Payment Integration
 * Redirects user to secure Stripe Payment Link
 */

const STRIPE_PRO_LINK = "https://buy.stripe.com/test_8x2aEZ94w1vsf1Oa1TaAw01";

/**
 * Redirects user to the Pro upgrade page.
 */
function goToPro() {
    const confirmRedirect = confirm("You will be redirected to secure Stripe payment. Do you wish to continue?");
    
    if (confirmRedirect) {
        console.log("🚀 Redirecting to Stripe...");
        window.location.href = STRIPE_PRO_LINK;
    }
}
