const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");
const multer = require("multer");
const {
  verifyAdmin,
  verifyAdminStatus,
} = require("../middleware/authAdmin.js");
require("dotenv").config();

const router = express.Router();
const SECRET_KEY = "SECRET_KEY"; // same as server.js

// POST /admin/login
// router.post("/login", async (req, res) => {
//   const supabase = req.app.locals.supabase;
//   const { email, password } = req.body;

//   try {
//     const { data: admin, error } = await supabase
//       .from("Admins")
//       .select("*")
//       .eq("email", email)
//       .single();

//     if (!admin) return res.status(400).json({ error: "Invalid admin username" });

//     const isMatch = await bcrypt.compare(password, admin.password_hash);
//     if (!isMatch) return res.status(400).json({ error: "Invalid password" });

//     const token = jwt.sign(
//       { id: admin.admin_id, email: admin.email, role: "admin" },
//       SECRET_KEY,
//       { expiresIn: "1h" }
//     );

//     res.cookie("adminToken", token, {
//       httpOnly: true,
//       secure: false,
//       sameSite: "lax",
//       maxAge: 60 * 60 * 1000,
//     });

//     res.json({
//       success: true,
//       message: "Admin login successful",
//       admin: { id: admin.admin_id, email: admin.email },
//     });

//   } catch (error) {
//     console.error("Admin login error:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// POST /admin/logout
// router.post("/logout", (req, res) => {
//   res.clearCookie("adminToken");
//   res.json({ success: true, message: "Admin logged out" });
// });

// // GET /admin/verify
// router.get("/verify", verifyAdminStatus);

// // GET /admin/dashboard
// router.get("/dashboard", verifyAdmin, async (req, res) => {
//   const supabase = req.app.locals.supabase;

//   try {
//     const { data: apartments } = await supabase.from("Apartments").select("*");
//     const { data: users } = await supabase.from("Users").select("*");

//     const occupied = apartments.filter(a => a.is_occupied).length;
//     const vacant = apartments.filter(a => !a.is_occupied).length;

//     res.json({
//       apartmentCount: apartments.length,
//       userCount: users.length,
//       apartments,
//       users,
//       occupied,
//       vacant,
//       adminEmail: req.admin.email,
//     });
//   } catch (error) {
//     console.error("Dashboard error:", error);
//     res.status(500).json({ error: "Failed to fetch dashboard data" });
//   }
// });

// GET /admin/lease
// router.get("/lease", verifyAdmin, async (req, res) => {
//   const supabase = req.app.locals.supabase;

//   const { data, error } = await supabase
//     .from("Leases")
//     .select(`
//       lease_id,
//       apartment_id,
//       user_id,
//       start_date,
//       end_date,
//       rent_amount,
//       status,
//       Apartments(address),
//       Users(email)
//     `)
//     .order("start_date", { ascending: false });

//   if (error) return res.status(500).json({ error });

//   const leases = data.map(l => ({
//     ...l,
//     address: l.Apartments.address,
//     email: l.Users.email,
//   }));

//   res.json({ leases });
// });

// // POST /admin/lease
// router.post("/lease", verifyAdmin, async (req, res) => {
//   const supabase = req.app.locals.supabase;
//   const { apartment_id, user_id, start_date, end_date, rent_amount } = req.body;

//   try {
//     await supabase.from("Leases").insert({
//       apartment_id,
//       user_id,
//       start_date,
//       end_date,
//       rent_amount,
//       status: 1,
//     });

//     await supabase
//       .from("Apartments")
//       .update({ is_occupied: true })
//       .eq("apartment_id", apartment_id);

//     res.json({ message: "Lease created and apartment marked as occupied" });
//   } catch (err) {
//     res.status(500).json({ error: "Failed to create lease" });
//   }
// });

// // PUT /admin/lease/:id/end
// router.put("/lease/:id/end", verifyAdmin, async (req, res) => {
//   const supabase = req.app.locals.supabase;
//   const { id } = req.params;

//   const { data: lease } = await supabase
//     .from("Leases")
//     .select("apartment_id")
//     .eq("lease_id", id)
//     .single();

//   if (!lease) return res.status(404).json({ error: "Lease not found" });

//   await supabase.from("Leases").update({ status: 0 }).eq("lease_id", id);
//   await supabase
//     .from("Apartments")
//     .update({ is_occupied: false })
//     .eq("apartment_id", lease.apartment_id);

//   res.json({ message: "Lease ended and apartment marked as vacant" });
// });

// PAYMENTS (GET)
// router.get("/payments", verifyAdmin, async (req, res) => {
//   const supabase = req.app.locals.supabase;

//   const { data: payments } = await supabase
//     .from("Payments")
//     .select(`
//       payment_id,
//       amount,
//       payment_date,
//       method,
//       status,
//       Leases(lease_id, Users(email), Apartments(address))
//     `)
//     .order("payment_date", { ascending: false });

//   const formatted = payments.map(p => ({
//     id: p.payment_id,
//     tenantName: p.Leases.Users.email,
//     apartment: p.Leases.Apartments.address,
//     leaseLabel: `Lease #${p.Leases.lease_id}`,
//     amount: p.amount,
//     method: p.method,
//     status: p.status,
//     date: p.payment_date,
//   }));

//   res.json({ payments: formatted });
// });

// PAYMENTS (POST)
// router.post("/payments", verifyAdmin, async (req, res) => {
//   const supabase = req.app.locals.supabase;
//   const { lease_id, amount, payment_date, method, status } = req.body;

//   const { data, error } = await supabase
//     .from("Payments")
//     .insert({ lease_id, amount, payment_date, method, status })
//     .select()
//     .single();

//   if (error) return res.status(500).json({ error });

//   res.status(201).json({ message: "Payment created", payment: data });
// });

// // FILE UPLOAD (same as before)
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, path.join(__dirname, "..", "uploads", "apartments"));
//   },
//   filename: (req, file, cb) => {
//     const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(null, unique + path.extname(file.originalname));
//   },
// });

const upload = multer({ storage });

// ADD APARTMENT
router.post("/add-lease", verifyAdmin, upload.array("images"), async (req, res) => {
  const supabase = req.app.locals.supabase;
  const { apartment_name, address, lat, lng, bed, bath, pricing } = req.body;

  const { data: apt } = await supabase
    .from("Apartments")
    .insert({
      apartment_name,
      address,
      bed,
      bath,
      pricing,
      lat: parseFloat(lat),
      lon: parseFloat(lng),
      is_occupied: false,
    })
    .select()
    .single();

  const files = req.files || [];
  for (const file of files) {
    await supabase.from("ApartmentImages").insert({
      apartment_id: apt.apartment_id,
      image_url: `/uploads/apartments/${file.filename}`,
    });
  }

  res.json({
    message: "Apartment and images saved",
    apartment_id: apt.apartment_id,
    images_saved: files.length,
  });
});

module.exports = router;