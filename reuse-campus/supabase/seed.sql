-- =============================================================
-- ReUse Campus - demo data for Supabase (PostgreSQL)
-- Password for all demo accounts: password
-- Same bcrypt hash as database/schema.sql
-- =============================================================

insert into public.admins (full_name, username, email, password) values
('Campus Administrator','admin','admin@reusecampus.edu','$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

insert into public.categories (name, slug, description, icon) values
('Textbooks','textbooks','Course books and reference materials','book'),
('Academic Notes','academic-notes','Handwritten and digital study notes','file-text'),
('Drawing Instruments','drawing-instruments','Compass sets, scales and drawing tools','pen-tool'),
('Calculators','calculators','Scientific and programmable calculators','calculator'),
('Electronics','electronics','Mobile phones, laptops and accessories','cpu'),
('Lab Equipment','lab-equipment','Lab kits, goggles and instruments','flask'),
('Stationery','stationery','Notebooks, pens and everyday supplies','edit-3'),
('Other Materials','other','Any other educational resources','layers');

insert into public.users
 (full_name, student_id, email, password, college, department, semester, phone,
  contact_preferences, bio, email_verified)
values
('Ayesha Rahman','STU-2021-0142','ayesha@student.edu','$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','Rajshahi Polytechnic Institute','Computer Science & Technology','5th Semester','01710000001','email','Computer science student who loves reusing resources.',true),
('Tanvir Hasan','STU-2020-0088','tanvir@student.edu','$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','Rajshahi Polytechnic Institute','Mechanical Engineering','6th Semester','01710000002','email','Mechanical engineering enthusiast.',true),
('Sadia Islam','STU-2022-0231','sadia@student.edu','$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','Rajshahi Polytechnic Institute','Civil Engineering','3rd Semester','01710000003','both','Always looking for study materials.',true),
('Rakibul Islam','STU-2019-0045','rakib@student.edu','$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','Rajshahi Polytechnic Institute','Electrical Engineering','8th Semester','01710000004','email','Final year student. Happy to help juniors.',true),
('Nusrat Jahan','STU-2021-0199','nusrat@student.edu','$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','Rajshahi Polytechnic Institute','Computer Science & Technology','5th Semester','01710000005','both','Sharing is caring.',true),
('Mehedi Hasan','STU-2022-0110','mehedi@student.edu','$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','Rajshahi Polytechnic Institute','Automobile Engineering','3rd Semester','01710000006','email','',true),
('Farzana Akter','STU-2020-0176','farzana@student.edu','$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','Rajshahi Polytechnic Institute','Architecture','6th Semester','01710000007','email','Architecture student and stationery hoarder.',true),
('Imran Hossain','STU-2023-0007','imran@student.edu','$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','Rajshahi Polytechnic Institute','Electronics & Communication','2nd Semester','01710000008','email','',false);

insert into public.listings
 (user_id, category_id, title, description, item_condition, exchange_type, price,
  availability, pickup_location, views, status, created_at)
values
(1,1,'Engineering Mathematics – 1st Year Textbook','B.Sc. Engineering Mathematics textbook by S. S. Sastry. Used for one semester, clean and complete with no missing pages. Some light highlighting on important formulas.','good','sale',350.00,'available','Library Gate, Main Campus',148,'active', now() - interval '1 day'),
(1,4,'Casio fx-991ES Plus Scientific Calculator','Original Casio scientific calculator in excellent condition. Comes with the cover and battery. Perfect for engineering students.','like_new','sale',850.00,'available','CSE Building',212,'active', now() - interval '3 hours'),
(2,3,'Complete Drawing Instrument Set','Professional drawing set containing compass, divider, set squares, protractor and scales. Ideal for first-year engineering drawing.','good','donation',0,'available','Mechanical Workshop',96,'active', now() - interval '2 days'),
(3,2,'C Programming Notes – Handwritten','Neat handwritten C programming notes covering pointers, arrays, structures and file handling. Great for exam preparation.','good','donation',0,'available','Civil Engineering Block',74,'active', now() - interval '5 hours'),
(4,5,'Arduino Uno Starter Kit','Arduino Uno R3 with cables, breadboard and sensors. Everything works perfectly. Looking to exchange for a good scientific calculator.','like_new','exchange',0,'available','ECE Lab',165,'active', now() - interval '4 days'),
(5,1,'Digital Electronics Textbook','Fundamentals of Digital Logic and Verilog Design. Almost new, purchased last semester.','new','borrow',0,'available','CSE Building',88,'active', now() - interval '6 hours'),
(6,6,'Basic Electrical Lab Kit','Lab kit with resistors, capacitors, multimeter and connecting wires. Complete set for basic electrical experiments.','fair','borrow',0,'available','Electrical Lab',53,'active', now() - interval '8 hours'),
(7,7,'Pack of 5 Engineering Notebooks','Unused A4 ruled notebooks, perfect for notes and assignments. Free to a good home.','new','donation',0,'available','Architecture Studio',41,'active', now() - interval '1 hour'),
(2,8,'USB Microscope for Lab Work','Compact USB microscope useful for material science and biology lab work. In good working condition.','good','sale',600.00,'available','Mechanical Workshop',63,'active', now() - interval '3 days'),
(8,4,'Scientific Calculator – Borrow for Exam','Need a scientific calculator for the upcoming semester? Borrow mine for a short period.','good','borrow',0,'available','Hostel Block B',29,'active', now() - interval '30 minutes');

insert into public.listing_images (listing_id, filename, is_primary) values
(1,'images/ph-book-math.svg',true),
(1,'images/ph-book-math-2.svg',false),
(2,'images/ph-calculator.svg',true),
(3,'images/ph-drawing.svg',true),
(4,'images/ph-notes.svg',true),
(5,'images/ph-electronics.svg',true),
(6,'images/ph-book-digital.svg',true),
(7,'images/ph-lab.svg',true),
(8,'images/ph-stationery.svg',true),
(9,'images/ph-electronics.svg',true),
(10,'images/ph-calculator.svg',1);

insert into public.favorites (user_id, listing_id) values
(3,2),(5,1),(8,3),(2,5);

insert into public.notifications (user_id, title, message, type, link, is_read) values
(1,'New request for your calculator','Sadia Islam requested to borrow your Casio calculator.','request','dashboard/requests.php',false),
(2,'Welcome to ReUse Campus','Your account is ready. Start listing resources today.','system','dashboard/index.php',false);

insert into public.item_requests (listing_id, requester_id, owner_id, message, status) values
(2,3,1,'Hi, I need this calculator for the exam. Can I borrow it for two weeks?','pending');

insert into public.exchange_history (listing_id, requester_id, owner_id, exchange_type, note) values
(4,6,3,'donation','Notes collected successfully.');
