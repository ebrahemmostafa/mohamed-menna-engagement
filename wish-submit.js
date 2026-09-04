const supabaseUrl = "https://jcuqwcwkowtjxcykstlf.supabase.co";
const supabasePublishableKey = "sb_publishable_BFtrH3u_sv9zat6B9SALyw_nS7Pajaa";
const wishesTable = "mohammed_menna_wishes";

const supabaseClient = window.supabase.createClient(supabaseUrl, supabasePublishableKey);
const form = document.getElementById("wishForm");
const nameInput = document.getElementById("wishName");
const messageInput = document.getElementById("wishMessage");
const sendButton = document.getElementById("wishSend");
const status = document.getElementById("wishStatus");

form.addEventListener("submit", async event => {
  event.preventDefault();
  const name = nameInput.value.trim() || "Guest";
  const message = messageInput.value.trim();

  if (!message) {
    status.textContent = "Write a wish first.";
    messageInput.focus();
    return;
  }

  sendButton.disabled = true;
  status.textContent = "Sending your wish...";

  const { error } = await supabaseClient
    .from(wishesTable)
    .insert([{ name, message }]);

  if (error) {
    console.error("Unable to send wish:", error.message);
    status.textContent = "We couldn't send your wish. Please try again.";
  } else {
    form.reset();
    status.textContent = "Your wish was sent. Thank you!";
  }

  sendButton.disabled = false;
});
