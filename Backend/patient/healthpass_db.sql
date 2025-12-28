-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: healthpass_db
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `auth_group`
--

DROP TABLE IF EXISTS `auth_group`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_group` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_group`
--

LOCK TABLES `auth_group` WRITE;
/*!40000 ALTER TABLE `auth_group` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_group` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_group_permissions`
--

DROP TABLE IF EXISTS `auth_group_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_group_permissions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `group_id` int NOT NULL,
  `permission_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_group_permissions_group_id_permission_id_0cd325b0_uniq` (`group_id`,`permission_id`),
  KEY `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` (`permission_id`),
  CONSTRAINT `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  CONSTRAINT `auth_group_permissions_group_id_b120cbf9_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_group_permissions`
--

LOCK TABLES `auth_group_permissions` WRITE;
/*!40000 ALTER TABLE `auth_group_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_group_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_permission`
--

DROP TABLE IF EXISTS `auth_permission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_permission` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `content_type_id` int NOT NULL,
  `codename` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_permission_content_type_id_codename_01ab375a_uniq` (`content_type_id`,`codename`),
  CONSTRAINT `auth_permission_content_type_id_2f476e4b_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_permission`
--

LOCK TABLES `auth_permission` WRITE;
/*!40000 ALTER TABLE `auth_permission` DISABLE KEYS */;
INSERT INTO `auth_permission` VALUES (1,'Can add log entry',1,'add_logentry'),(2,'Can change log entry',1,'change_logentry'),(3,'Can delete log entry',1,'delete_logentry'),(4,'Can view log entry',1,'view_logentry'),(5,'Can add permission',2,'add_permission'),(6,'Can change permission',2,'change_permission'),(7,'Can delete permission',2,'delete_permission'),(8,'Can view permission',2,'view_permission'),(9,'Can add group',3,'add_group'),(10,'Can change group',3,'change_group'),(11,'Can delete group',3,'delete_group'),(12,'Can view group',3,'view_group'),(13,'Can add user',4,'add_user'),(14,'Can change user',4,'change_user'),(15,'Can delete user',4,'delete_user'),(16,'Can view user',4,'view_user'),(17,'Can add content type',5,'add_contenttype'),(18,'Can change content type',5,'change_contenttype'),(19,'Can delete content type',5,'delete_contenttype'),(20,'Can view content type',5,'view_contenttype'),(21,'Can add session',6,'add_session'),(22,'Can change session',6,'change_session'),(23,'Can delete session',6,'delete_session'),(24,'Can view session',6,'view_session'),(25,'Can add patient',7,'add_patient'),(26,'Can change patient',7,'change_patient'),(27,'Can delete patient',7,'delete_patient'),(28,'Can view patient',7,'view_patient'),(29,'Can add doctor',8,'add_doctor'),(30,'Can change doctor',8,'change_doctor'),(31,'Can delete doctor',8,'delete_doctor'),(32,'Can view doctor',8,'view_doctor'),(33,'Can add appointment',9,'add_appointment'),(34,'Can change appointment',9,'change_appointment'),(35,'Can delete appointment',9,'delete_appointment'),(36,'Can view appointment',9,'view_appointment'),(37,'Can add Token',10,'add_token'),(38,'Can change Token',10,'change_token'),(39,'Can delete Token',10,'delete_token'),(40,'Can view Token',10,'view_token'),(41,'Can add Token',11,'add_tokenproxy'),(42,'Can change Token',11,'change_tokenproxy'),(43,'Can delete Token',11,'delete_tokenproxy'),(44,'Can view Token',11,'view_tokenproxy'),(45,'Can add appointment',12,'add_appointment'),(46,'Can change appointment',12,'change_appointment'),(47,'Can delete appointment',12,'delete_appointment'),(48,'Can view appointment',12,'view_appointment');
/*!40000 ALTER TABLE `auth_permission` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_user`
--

DROP TABLE IF EXISTS `auth_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `password` varchar(128) NOT NULL,
  `last_login` datetime(6) DEFAULT NULL,
  `is_superuser` tinyint(1) NOT NULL,
  `username` varchar(150) NOT NULL,
  `first_name` varchar(150) NOT NULL,
  `last_name` varchar(150) NOT NULL,
  `email` varchar(254) NOT NULL,
  `is_staff` tinyint(1) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `date_joined` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_user`
--

LOCK TABLES `auth_user` WRITE;
/*!40000 ALTER TABLE `auth_user` DISABLE KEYS */;
INSERT INTO `auth_user` VALUES (1,'pbkdf2_sha256$1000000$3LxrwDN2FtymZHh2OEjrsx$xK3YXAOj8h3QAQ7lk5Ove+d+zdW7qA8YTq/GiX5TETw=',NULL,0,'lekshmi123','','','lekshmi@example.com',0,1,'2025-07-26 05:25:18.926698'),(2,'pbkdf2_sha256$1000000$mWXi8GJ3f7pOSTsQBihOQR$5q42jLqAtjajySineXrWtSaYcGwt+zynf3tgLI8oi1w=',NULL,0,'lekshmi','','','Lekshmi@gmail.com',0,1,'2025-07-26 14:38:20.628030'),(3,'pbkdf2_sha256$1000000$SL0o3XjjrzIaV9sTluT3Nt$hes858M6xhYU92wb/hQ/Y2s7XKGvVBdi0GwUbe8HK68=',NULL,0,'lekshmi131','','','lekshmi131@gmail.com',0,1,'2025-08-03 11:50:52.586239'),(4,'pbkdf2_sha256$1000000$ib199AIhDoOhnBQC8QpHVJ$BakkiEfsGBKEC46khXJNThfQQN7/zBPcaKHLm7iyFT0=',NULL,0,'minna','','','lekshmi245@gmail.com',0,1,'2025-09-14 10:41:34.580557'),(5,'pbkdf2_sha256$1000000$RsEZ2HGT04fk0Yd6jNyUAS$pRxH5OuIBUGNtMPfPJrPUCUkQzFBUEHOKkTyLIGLS1U=',NULL,0,'Lekshmi R Rajan','','','lekshmi@gmail.com',0,1,'2025-09-14 11:02:30.605477'),(6,'pbkdf2_sha256$1000000$4FOff0LTG5WfeSSu6Fkzfv$K5NlV1WbdCpnI8u7zYR9UHaDiTTyI6xf6BbhQSHHdoQ=',NULL,0,'Minna Joby','','','minnajobby@gmail.com',0,1,'2025-09-14 11:39:47.734343'),(7,'pbkdf2_sha256$1000000$SquTnqZN5RYtsLBn71qC50$Hwg5RfzO4G92LVkRCCvHoC/9PuO0vg4vNKTX8Y0gqO4=',NULL,0,'Minna Joby v','','','lekshmi245@gmail.com',0,1,'2025-09-14 14:01:50.581987'),(8,'pbkdf2_sha256$1000000$ZHFAfX7UqXq1VXjmhNe3Oa$OMyU71WDWl0RR59C2NWwoDcXd+kvEIZjRgkViYg6Dxs=',NULL,0,'LEKSHMII','','','lekshmirajan2345@gmail.com',0,1,'2025-09-14 14:09:55.971984'),(9,'pbkdf2_sha256$1000000$pMtToyBZfADHwBU737qIK0$oweyCQ9Ae85FJhWT7+/TuCIr2Ur4TaSbfknOs4/VFM8=',NULL,0,'shine','','','lekshmirajan2345@gmail.com',0,1,'2025-09-14 14:44:55.607784'),(10,'pbkdf2_sha256$1000000$j0rI2wXNdhCzB4WbQXhwnI$cHTePwheJkMDTgWdnLng1jUsvrlRcumOikN8lXgH53Y=',NULL,0,'Lekshmi1234','','','lekshmi245@gmail.com',0,1,'2025-09-14 14:48:08.033169'),(11,'pbkdf2_sha256$1000000$OGj3O6KviwbH0QWXRWIgaD$l3UolxCTBTQI8Jyr5hoEtWH4R9G8Dlsh4xlNi+DEQ9k=',NULL,0,'Almas N A','','','almasna@example.com',0,1,'2025-09-16 07:19:49.873056');
/*!40000 ALTER TABLE `auth_user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_user_groups`
--

DROP TABLE IF EXISTS `auth_user_groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_user_groups` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `group_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_user_groups_user_id_group_id_94350c0c_uniq` (`user_id`,`group_id`),
  KEY `auth_user_groups_group_id_97559544_fk_auth_group_id` (`group_id`),
  CONSTRAINT `auth_user_groups_group_id_97559544_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`),
  CONSTRAINT `auth_user_groups_user_id_6a12ed8b_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_user_groups`
--

LOCK TABLES `auth_user_groups` WRITE;
/*!40000 ALTER TABLE `auth_user_groups` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_user_groups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_user_user_permissions`
--

DROP TABLE IF EXISTS `auth_user_user_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_user_user_permissions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `permission_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_user_user_permissions_user_id_permission_id_14a6b632_uniq` (`user_id`,`permission_id`),
  KEY `auth_user_user_permi_permission_id_1fbb5f2c_fk_auth_perm` (`permission_id`),
  CONSTRAINT `auth_user_user_permi_permission_id_1fbb5f2c_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  CONSTRAINT `auth_user_user_permissions_user_id_a95ead1b_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_user_user_permissions`
--

LOCK TABLES `auth_user_user_permissions` WRITE;
/*!40000 ALTER TABLE `auth_user_user_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_user_user_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `authtoken_token`
--

DROP TABLE IF EXISTS `authtoken_token`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `authtoken_token` (
  `key` varchar(40) NOT NULL,
  `created` datetime(6) NOT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`key`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `authtoken_token_user_id_35299eff_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `authtoken_token`
--

LOCK TABLES `authtoken_token` WRITE;
/*!40000 ALTER TABLE `authtoken_token` DISABLE KEYS */;
INSERT INTO `authtoken_token` VALUES ('2a859eab0724d2adf2d52f0be2d7618512075848','2025-09-14 14:01:51.035853',7),('3cbaf518796ded8dc2d218a1e5b2bd3aa9701cec','2025-08-03 13:52:19.585448',2),('60ea9ab1f77b06c899a4f8da449e04a2eb8f2a04','2025-09-14 14:48:08.424401',10),('a06c17af0040df55da71e6066256a8f0bedcffb6','2025-09-14 14:44:56.240660',9),('c60bfda263745e743c347e558a141037a1133179','2025-09-16 07:19:51.258109',11),('c8197a0666a34a7032396e4328597826da5c394d','2025-09-14 10:41:35.058774',4),('c916a1cf2ec1bbc46b26c7f2baae27cec2fe3f1d','2025-09-14 11:02:31.780783',5),('e8fd2a018d4a7a9e0929376959990917bed0723c','2025-09-14 11:39:48.169458',6),('fd4a8d48e0a8e3d0624f6980649ec8e6ee0ae7ad','2025-09-14 14:09:56.487001',8);
/*!40000 ALTER TABLE `authtoken_token` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_admin_log`
--

DROP TABLE IF EXISTS `django_admin_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_admin_log` (
  `id` int NOT NULL AUTO_INCREMENT,
  `action_time` datetime(6) NOT NULL,
  `object_id` longtext,
  `object_repr` varchar(200) NOT NULL,
  `action_flag` smallint unsigned NOT NULL,
  `change_message` longtext NOT NULL,
  `content_type_id` int DEFAULT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `django_admin_log_content_type_id_c4bce8eb_fk_django_co` (`content_type_id`),
  KEY `django_admin_log_user_id_c564eba6_fk_auth_user_id` (`user_id`),
  CONSTRAINT `django_admin_log_content_type_id_c4bce8eb_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`),
  CONSTRAINT `django_admin_log_user_id_c564eba6_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`),
  CONSTRAINT `django_admin_log_chk_1` CHECK ((`action_flag` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_admin_log`
--

LOCK TABLES `django_admin_log` WRITE;
/*!40000 ALTER TABLE `django_admin_log` DISABLE KEYS */;
/*!40000 ALTER TABLE `django_admin_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_content_type`
--

DROP TABLE IF EXISTS `django_content_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_content_type` (
  `id` int NOT NULL AUTO_INCREMENT,
  `app_label` varchar(100) NOT NULL,
  `model` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `django_content_type_app_label_model_76bd3d3b_uniq` (`app_label`,`model`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_content_type`
--

LOCK TABLES `django_content_type` WRITE;
/*!40000 ALTER TABLE `django_content_type` DISABLE KEYS */;
INSERT INTO `django_content_type` VALUES (1,'admin','logentry'),(3,'auth','group'),(2,'auth','permission'),(4,'auth','user'),(10,'authtoken','token'),(11,'authtoken','tokenproxy'),(5,'contenttypes','contenttype'),(9,'patientapp','appointment'),(8,'patientapp','doctor'),(7,'patientapp','patient'),(12,'receptionist','appointment'),(6,'sessions','session');
/*!40000 ALTER TABLE `django_content_type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_migrations`
--

DROP TABLE IF EXISTS `django_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_migrations` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `app` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `applied` datetime(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_migrations`
--

LOCK TABLES `django_migrations` WRITE;
/*!40000 ALTER TABLE `django_migrations` DISABLE KEYS */;
INSERT INTO `django_migrations` VALUES (1,'contenttypes','0001_initial','2025-07-20 17:50:30.209904'),(2,'auth','0001_initial','2025-07-20 17:50:30.729925'),(3,'admin','0001_initial','2025-07-20 17:50:30.856953'),(4,'admin','0002_logentry_remove_auto_add','2025-07-20 17:50:30.862983'),(5,'admin','0003_logentry_add_action_flag_choices','2025-07-20 17:50:30.870123'),(6,'contenttypes','0002_remove_content_type_name','2025-07-20 17:50:30.974438'),(7,'auth','0002_alter_permission_name_max_length','2025-07-20 17:50:31.056546'),(8,'auth','0003_alter_user_email_max_length','2025-07-20 17:50:31.085937'),(9,'auth','0004_alter_user_username_opts','2025-07-20 17:50:31.092547'),(10,'auth','0005_alter_user_last_login_null','2025-07-20 17:50:31.146687'),(11,'auth','0006_require_contenttypes_0002','2025-07-20 17:50:31.149692'),(12,'auth','0007_alter_validators_add_error_messages','2025-07-20 17:50:31.156254'),(13,'auth','0008_alter_user_username_max_length','2025-07-20 17:50:31.239355'),(14,'auth','0009_alter_user_last_name_max_length','2025-07-20 17:50:31.320915'),(15,'auth','0010_alter_group_name_max_length','2025-07-20 17:50:31.341763'),(16,'auth','0011_update_proxy_permissions','2025-07-20 17:50:31.348945'),(17,'auth','0012_alter_user_first_name_max_length','2025-07-20 17:50:31.402758'),(18,'sessions','0001_initial','2025-07-20 17:50:31.433877'),(19,'patientapp','0001_initial','2025-07-26 04:16:51.182832'),(20,'patientapp','0002_doctor','2025-08-03 12:28:15.390999'),(21,'patientapp','0003_appointment','2025-08-03 13:41:50.378488'),(22,'authtoken','0001_initial','2025-08-03 13:52:02.256422'),(23,'authtoken','0002_auto_20160226_1747','2025-08-03 13:52:02.278197'),(24,'authtoken','0003_tokenproxy','2025-08-03 13:52:02.282569'),(25,'authtoken','0004_alter_tokenproxy_options','2025-08-03 13:52:02.291728'),(26,'receptionist','0001_initial','2025-09-12 13:59:55.219544'),(27,'receptionist','0002_remove_appointment_patient_remove_token_appointment_and_more','2025-09-12 13:59:55.717498'),(28,'patientapp','0004_remove_appointment_doctor_remove_appointment_patient_and_more','2025-09-14 10:43:46.847908'),(29,'patientapp','0005_doctor_alter_patient_address_alter_patient_phone_and_more','2025-09-14 10:43:47.020183'),(30,'patientapp','0006_appointment_payment_status','2025-09-14 10:43:47.078126');
/*!40000 ALTER TABLE `django_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_session`
--

DROP TABLE IF EXISTS `django_session`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_session` (
  `session_key` varchar(40) NOT NULL,
  `session_data` longtext NOT NULL,
  `expire_date` datetime(6) NOT NULL,
  PRIMARY KEY (`session_key`),
  KEY `django_session_expire_date_a5c62663` (`expire_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_session`
--

LOCK TABLES `django_session` WRITE;
/*!40000 ALTER TABLE `django_session` DISABLE KEYS */;
/*!40000 ALTER TABLE `django_session` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `patientapp_appointment`
--

DROP TABLE IF EXISTS `patientapp_appointment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `patientapp_appointment` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `appointment_date` date NOT NULL,
  `appointment_time` varchar(50) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `patient_id` bigint NOT NULL,
  `doctor_id` bigint NOT NULL,
  `payment_status` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `patientapp_appointme_patient_id_162ccde0_fk_patientap` (`patient_id`),
  KEY `patientapp_appointme_doctor_id_857bef2e_fk_patientap` (`doctor_id`),
  CONSTRAINT `patientapp_appointme_doctor_id_857bef2e_fk_patientap` FOREIGN KEY (`doctor_id`) REFERENCES `patientapp_doctor` (`id`),
  CONSTRAINT `patientapp_appointme_patient_id_162ccde0_fk_patientap` FOREIGN KEY (`patient_id`) REFERENCES `patientapp_patient` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patientapp_appointment`
--

LOCK TABLES `patientapp_appointment` WRITE;
/*!40000 ALTER TABLE `patientapp_appointment` DISABLE KEYS */;
INSERT INTO `patientapp_appointment` VALUES (1,'2025-09-17','09:00','2025-09-14 10:49:49.117851',4,2,0),(2,'2025-09-23','09:30','2025-09-14 10:50:51.891936',4,2,0),(3,'2025-09-17','08:30','2025-09-14 11:02:47.478600',5,2,0),(4,'2025-09-25','10:00','2025-09-14 11:40:09.578445',6,3,0),(5,'2025-09-27','11:00','2025-09-14 11:43:38.211873',6,1,0),(6,'2025-09-23','16:00','2025-09-14 11:51:38.918767',6,3,0),(7,'2025-09-17','09:30','2025-09-14 14:02:02.909497',7,2,0),(8,'2025-09-26','09:30','2025-09-14 14:10:14.672679',8,1,0);
/*!40000 ALTER TABLE `patientapp_appointment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `patientapp_doctor`
--

DROP TABLE IF EXISTS `patientapp_doctor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `patientapp_doctor` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `specialization` varchar(100) NOT NULL,
  `available_days` varchar(100) NOT NULL,
  `available_time` varchar(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patientapp_doctor`
--

LOCK TABLES `patientapp_doctor` WRITE;
/*!40000 ALTER TABLE `patientapp_doctor` DISABLE KEYS */;
INSERT INTO `patientapp_doctor` VALUES (1,'Dr. Rahul Nair','Cardiologist','Mon, Wed, Fri','10:00 AM - 1:00 PM'),(2,'Dr. Priya Menon','Dermatologist','Tue, Thu','2:00 PM - 5:00 PM'),(3,'Dr. Arjun Varma','Orthopedic','Sat','11:00 AM - 3:00 PM');
/*!40000 ALTER TABLE `patientapp_doctor` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `patientapp_patient`
--

DROP TABLE IF EXISTS `patientapp_patient`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `patientapp_patient` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `phone` varchar(15) NOT NULL,
  `address` longtext NOT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `patientapp_patient_user_id_dc82480e_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patientapp_patient`
--

LOCK TABLES `patientapp_patient` WRITE;
/*!40000 ALTER TABLE `patientapp_patient` DISABLE KEYS */;
INSERT INTO `patientapp_patient` VALUES (1,'9876543210','Thiruvananthapuram',1),(2,'1234567890','Test Address',2),(3,'9876543210','Kollam, Kerala',3),(4,'','',4),(5,'','',5),(6,'','',6),(7,'','',7),(8,'','',8),(9,'','',9),(10,'','',10),(11,'','',11);
/*!40000 ALTER TABLE `patientapp_patient` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `receptionist_appointment`
--

DROP TABLE IF EXISTS `receptionist_appointment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `receptionist_appointment` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `doctor_name` varchar(100) DEFAULT NULL,
  `appointment_date` datetime(6) DEFAULT NULL,
  `status` varchar(20) NOT NULL,
  `patient_name` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `receptionist_appointment`
--

LOCK TABLES `receptionist_appointment` WRITE;
/*!40000 ALTER TABLE `receptionist_appointment` DISABLE KEYS */;
/*!40000 ALTER TABLE `receptionist_appointment` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-09-16 14:23:44

