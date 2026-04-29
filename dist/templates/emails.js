export function welcomeEmail(name, role) {
    const ctaText = role === "HOST" ? "Create Your First Listing" : "Explore Listings";
    const ctaHref = role === "HOST"
        ? "http://localhost:3000/listings/new"
        : "http://localhost:3000/listings";
    const message = role === "HOST"
        ? "Start earning by hosting guests from around the world."
        : "Discover unique stays and experiences wherever you go.";
    return `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h1 style="color: #FF5A5F;">Welcome to Airbnb, ${name}</h1>
    <p>Your account has been created successfully.</p>
    <p>${message}</p>
    <a href="${ctaHref}" style="display: inline-block; background-color: #FF5A5F; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 10px;">
      ${ctaText}
    </a>
  </div>`;
}
export function bookingConfirmationEmail(guestName, listingTitle, location, checkIn, checkOut, totalPrice) {
    return `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h1 style="color: #FF5A5F;">Booking Confirmed</h1>
    <p>Hi ${guestName}, your booking is confirmed.</p>
    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
    <h2 style="color: #FF5A5F; margin-bottom: 4px;">${listingTitle}</h2>
    <p style="margin: 4px 0;"><strong>Location:</strong> ${location}</p>
    <p style="margin: 4px 0;"><strong>Check-in:</strong> ${checkIn}</p>
    <p style="margin: 4px 0;"><strong>Check-out:</strong> ${checkOut}</p>
    <p style="margin: 4px 0;"><strong>Total Price:</strong> $${totalPrice.toFixed(2)}</p>
    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
    <p style="font-size: 13px; color: #555;">Please review our <a href="http://localhost:3000/cancellation-policy" style="color: #FF5A5F; text-decoration: none;">cancellation policy</a> for more details.</p>
  </div>`;
}
export function bookingCancellationEmail(guestName, listingTitle, checkIn, checkOut) {
    return `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h1 style="color: #FF5A5F;">Booking Cancelled</h1>
    <p>Hi ${guestName},</p>
    <p>Your booking for <strong>${listingTitle}</strong> has been cancelled.</p>
    <p><strong>Check-in:</strong> ${checkIn}<br/><strong>Check-out:</strong> ${checkOut}</p>
    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
    <p>We are sorry to see this booking go. Explore other listings and plan your next trip!</p>
    <a href="http://localhost:3000/listings" style="display: inline-block; background-color: #FF5A5F; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 10px;">
      Explore Listings
    </a>
  </div>`;
}
export function passwordResetEmail(name, resetLink) {
    return `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h1 style="color: #FF5A5F;">Password Reset</h1>
    <p>Hi ${name},</p>
    <p>Click the button below to reset your password. This link will expire in 1 hour.</p>
    <a href="${resetLink}" style="display: inline-block; background-color: #FF5A5F; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 10px;">
      Reset Password
    </a>
    <p style="color: #888; font-size: 12px; margin-top: 20px;">If you did not request this, ignore this email.</p>
  </div>`;
}
//# sourceMappingURL=emails.js.map