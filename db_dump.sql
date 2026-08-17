-- MySQL dump 10.13  Distrib 8.0.46, for Linux (x86_64)
--
-- Host: localhost    Database: atsolar_db
-- ------------------------------------------------------
-- Server version	8.0.46-0ubuntu0.22.04.3

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
-- Table structure for table `CheckIn`
--

DROP TABLE IF EXISTS `CheckIn`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `CheckIn` (
  `id` int NOT NULL AUTO_INCREMENT,
  `shopId` int NOT NULL,
  `userId` int NOT NULL,
  `latitude` double NOT NULL,
  `longitude` double NOT NULL,
  `timestamp` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `CheckIn_shopId_fkey` (`shopId`),
  KEY `CheckIn_userId_fkey` (`userId`),
  CONSTRAINT `CheckIn_shopId_fkey` FOREIGN KEY (`shopId`) REFERENCES `Shop` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `CheckIn_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `CheckIn`
--

LOCK TABLES `CheckIn` WRITE;
/*!40000 ALTER TABLE `CheckIn` DISABLE KEYS */;
/*!40000 ALTER TABLE `CheckIn` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Competitor`
--

DROP TABLE IF EXISTS `Competitor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Competitor` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `flagshipProduct` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `price` double DEFAULT NULL,
  `threatLevel` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `marketShare` double DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Competitor_name_key` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Competitor`
--

LOCK TABLES `Competitor` WRITE;
/*!40000 ALTER TABLE `Competitor` DISABLE KEYS */;
/*!40000 ALTER TABLE `Competitor` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Notification`
--

DROP TABLE IF EXISTS `Notification`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Notification` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `audience` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Notification`
--

LOCK TABLES `Notification` WRITE;
/*!40000 ALTER TABLE `Notification` DISABLE KEYS */;
/*!40000 ALTER TABLE `Notification` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `PriceHistory`
--

DROP TABLE IF EXISTS `PriceHistory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `PriceHistory` (
  `id` int NOT NULL AUTO_INCREMENT,
  `productId` int NOT NULL,
  `oldPrice` double NOT NULL,
  `newPrice` double NOT NULL,
  `updatedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `PriceHistory`
--

LOCK TABLES `PriceHistory` WRITE;
/*!40000 ALTER TABLE `PriceHistory` DISABLE KEYS */;
/*!40000 ALTER TABLE `PriceHistory` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Product`
--

DROP TABLE IF EXISTS `Product`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Product` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `brand` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `model` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `warranty` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `price` double NOT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Product`
--

LOCK TABLES `Product` WRITE;
/*!40000 ALTER TABLE `Product` DISABLE KEYS */;
/*!40000 ALTER TABLE `Product` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Role`
--

DROP TABLE IF EXISTS `Role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Role` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `permissions` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Role_name_key` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Role`
--

LOCK TABLES `Role` WRITE;
/*!40000 ALTER TABLE `Role` DISABLE KEYS */;
INSERT INTO `Role` VALUES (1,'Admin','{\"all\": true}'),(2,'TSO','{\"surveys\": true, \"checkin\": true}');
/*!40000 ALTER TABLE `Role` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Shop`
--

DROP TABLE IF EXISTS `Shop`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Shop` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ownerName` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contactNo` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `latitude` double DEFAULT NULL,
  `longitude` double DEFAULT NULL,
  `type` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `classification` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `territoryId` int NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `Shop_territoryId_fkey` (`territoryId`),
  CONSTRAINT `Shop_territoryId_fkey` FOREIGN KEY (`territoryId`) REFERENCES `Territory` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Shop`
--

LOCK TABLES `Shop` WRITE;
/*!40000 ALTER TABLE `Shop` DISABLE KEYS */;
INSERT INTO `Shop` VALUES (1,'Mobile Zone Blue Area','Waqas Ali',NULL,NULL,NULL,33.7294,73.0931,'Dealer','Large',1,'2026-06-24 13:22:59.126','2026-06-24 13:22:59.126'),(2,'Telecom Hub F-10','Ahmed Khan',NULL,NULL,NULL,33.6941,73.0142,'Retailer','Medium',1,'2026-06-24 13:22:59.126','2026-06-24 13:22:59.126'),(3,'City Cell Plaza','Farhan',NULL,NULL,NULL,33.7121,73.056,'Retailer','Small',1,'2026-06-24 13:22:59.126','2026-06-24 13:22:59.126'),(4,'Tech Store Gulberg','Hassan',NULL,NULL,NULL,31.5204,74.3587,'Dealer','Large',2,'2026-06-24 13:22:59.126','2026-06-24 13:22:59.126'),(5,'Mega Mobiles','Zeeshan',NULL,NULL,NULL,31.5,74.34,'Retailer','Medium',2,'2026-06-24 13:22:59.126','2026-06-24 13:22:59.126');
/*!40000 ALTER TABLE `Shop` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `SupportTicket`
--

DROP TABLE IF EXISTS `SupportTicket`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `SupportTicket` (
  `id` int NOT NULL AUTO_INCREMENT,
  `subject` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `priority` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `SupportTicket`
--

LOCK TABLES `SupportTicket` WRITE;
/*!40000 ALTER TABLE `SupportTicket` DISABLE KEYS */;
/*!40000 ALTER TABLE `SupportTicket` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `SurveyAnswer`
--

DROP TABLE IF EXISTS `SurveyAnswer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `SurveyAnswer` (
  `id` int NOT NULL AUTO_INCREMENT,
  `responseId` int NOT NULL,
  `questionId` int NOT NULL,
  `value` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  KEY `SurveyAnswer_responseId_fkey` (`responseId`),
  KEY `SurveyAnswer_questionId_fkey` (`questionId`),
  CONSTRAINT `SurveyAnswer_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `SurveyQuestion` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `SurveyAnswer_responseId_fkey` FOREIGN KEY (`responseId`) REFERENCES `SurveyResponse` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `SurveyAnswer`
--

LOCK TABLES `SurveyAnswer` WRITE;
/*!40000 ALTER TABLE `SurveyAnswer` DISABLE KEYS */;
/*!40000 ALTER TABLE `SurveyAnswer` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `SurveyQuestion`
--

DROP TABLE IF EXISTS `SurveyQuestion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `SurveyQuestion` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sectionId` int NOT NULL,
  `questionText` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` text COLLATE utf8mb4_unicode_ci,
  `isRequired` tinyint(1) NOT NULL DEFAULT '0',
  `orderIndex` int NOT NULL,
  `parentQuestionId` int DEFAULT NULL,
  `showIfParentValue` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `SurveyQuestion_sectionId_fkey` (`sectionId`),
  KEY `SurveyQuestion_parentQuestionId_fkey` (`parentQuestionId`),
  CONSTRAINT `SurveyQuestion_parentQuestionId_fkey` FOREIGN KEY (`parentQuestionId`) REFERENCES `SurveyQuestion` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `SurveyQuestion_sectionId_fkey` FOREIGN KEY (`sectionId`) REFERENCES `SurveySection` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=54 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `SurveyQuestion`
--

LOCK TABLES `SurveyQuestion` WRITE;
/*!40000 ALTER TABLE `SurveyQuestion` DISABLE KEYS */;
INSERT INTO `SurveyQuestion` VALUES (38,10,'Name of Outlet','text',NULL,1,0,NULL,NULL),(39,10,'Address','text',NULL,1,1,NULL,NULL),(40,10,'City / Town','text',NULL,1,2,NULL,NULL),(41,10,'Contact Person','text',NULL,1,3,NULL,NULL),(42,10,'Contact No(s)','number',NULL,1,4,NULL,NULL),(43,10,'Type','dropdown','[\"Importer\",\"Distributor\",\"Dealer\",\"Wholesaler\",\"Retailer\"]',1,5,NULL,NULL),(44,10,'Classification','dropdown','[\"Large\",\"Medium\",\"Small\"]',1,6,NULL,NULL),(45,11,'Source of Buying (Name of Dealer/Wholesaler/Distributor)','text',NULL,1,0,NULL,NULL),(46,11,'Payment Terms','dropdown','[\"100% ADVANCE\",\"PART ADVANCE & PART COD\",\"100% COD\",\"PART ADVANCE & PART CREDIT\",\"100% CREDIT\",\"CASH PURCHASE\"]',1,1,NULL,NULL),(47,11,'Logistics','radio','[\"OWN\",\"SOURCE\"]',1,2,NULL,NULL),(48,12,'Incentives / Commissions / Discounts','dropdown','[\"TIMELY PAYMENT BASED\",\"GIFT CARDS FOR NEW CUSTOMER\",\"SPECIAL DEALER / WHOLESALE/ DISTRIBUTOR DISCOUNT ON VOLUME BUYING\",\"PERFORMANCE BASED REBATES\",\"SPECIAL SEASON INCENTIVE\",\"SALES VOLUME BONUSES\",\"PRODUCT SPECIFIC REWARD\"]',0,0,NULL,NULL),(49,12,'Dealers Recognition Programs (Certificates)','radio','[\"Yes\",\"No\"]',0,1,NULL,NULL),(50,12,'Yearly Foreign Trips','radio','[\"Yes\",\"No\"]',0,2,NULL,NULL),(51,12,'Loyalty / Dealer Contests Programe','radio','[\"Yes\",\"No\"]',0,3,NULL,NULL),(52,13,'Reason for Unavailability of itel Brand','dropdown','[\"PRICE\",\"MARGINS\",\"QUALITY\",\"CAMPATABILITY\",\"WARRANTY\",\"NO SERVICE\",\"PAYMENT ISSUES\",\"BRAND AWARENESS\",\"CONSUMER DEMANDS\",\"BRAND EQUITY\",\"LACK OF MARKETING COMPGAINS\",\"DISCOUNTS / COMMISIONS\"]',0,0,NULL,NULL),(53,13,'Willingness to keep itel as','dropdown','[\"DISTRIBUTOR\",\"DEALER\",\"WHOLSALER\"]',1,1,NULL,NULL);
/*!40000 ALTER TABLE `SurveyQuestion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `SurveyResponse`
--

DROP TABLE IF EXISTS `SurveyResponse`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `SurveyResponse` (
  `id` int NOT NULL AUTO_INCREMENT,
  `templateId` int NOT NULL,
  `shopId` int NOT NULL,
  `userId` int NOT NULL,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `startedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `completedAt` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `SurveyResponse_templateId_fkey` (`templateId`),
  KEY `SurveyResponse_shopId_fkey` (`shopId`),
  KEY `SurveyResponse_userId_fkey` (`userId`),
  CONSTRAINT `SurveyResponse_shopId_fkey` FOREIGN KEY (`shopId`) REFERENCES `Shop` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `SurveyResponse_templateId_fkey` FOREIGN KEY (`templateId`) REFERENCES `SurveyTemplate` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `SurveyResponse_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `SurveyResponse`
--

LOCK TABLES `SurveyResponse` WRITE;
/*!40000 ALTER TABLE `SurveyResponse` DISABLE KEYS */;
/*!40000 ALTER TABLE `SurveyResponse` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `SurveySection`
--

DROP TABLE IF EXISTS `SurveySection`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `SurveySection` (
  `id` int NOT NULL AUTO_INCREMENT,
  `templateId` int NOT NULL,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `orderIndex` int NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `SurveySection_templateId_fkey` (`templateId`),
  CONSTRAINT `SurveySection_templateId_fkey` FOREIGN KEY (`templateId`) REFERENCES `SurveyTemplate` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `SurveySection`
--

LOCK TABLES `SurveySection` WRITE;
/*!40000 ALTER TABLE `SurveySection` DISABLE KEYS */;
INSERT INTO `SurveySection` VALUES (10,4,'Outlet Details',0,'2026-06-24 13:51:44.489'),(11,4,'Sourcing & Payment Terms',1,'2026-06-24 13:51:44.492'),(12,4,'Incentives & Programs',2,'2026-06-24 13:51:44.495'),(13,4,'itel Brand Perception',3,'2026-06-24 13:51:44.498');
/*!40000 ALTER TABLE `SurveySection` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `SurveyTemplate`
--

DROP TABLE IF EXISTS `SurveyTemplate`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `SurveyTemplate` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `SurveyTemplate`
--

LOCK TABLES `SurveyTemplate` WRITE;
/*!40000 ALTER TABLE `SurveyTemplate` DISABLE KEYS */;
INSERT INTO `SurveyTemplate` VALUES (4,'itel Market Visit Format','Official survey mapped from Excel for sales team market visits.',1,'2026-06-24 13:51:44.487','2026-06-24 13:51:44.487');
/*!40000 ALTER TABLE `SurveyTemplate` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `SystemSetting`
--

DROP TABLE IF EXISTS `SystemSetting`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `SystemSetting` (
  `id` int NOT NULL AUTO_INCREMENT,
  `key` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `SystemSetting_key_key` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `SystemSetting`
--

LOCK TABLES `SystemSetting` WRITE;
/*!40000 ALTER TABLE `SystemSetting` DISABLE KEYS */;
/*!40000 ALTER TABLE `SystemSetting` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Territory`
--

DROP TABLE IF EXISTS `Territory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Territory` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `region` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Territory_name_key` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Territory`
--

LOCK TABLES `Territory` WRITE;
/*!40000 ALTER TABLE `Territory` DISABLE KEYS */;
INSERT INTO `Territory` VALUES (1,'Islamabad North','North'),(2,'Lahore Central','Central');
/*!40000 ALTER TABLE `Territory` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `TradeProgram`
--

DROP TABLE IF EXISTS `TradeProgram`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `TradeProgram` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `budget` double DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `TradeProgram`
--

LOCK TABLES `TradeProgram` WRITE;
/*!40000 ALTER TABLE `TradeProgram` DISABLE KEYS */;
/*!40000 ALTER TABLE `TradeProgram` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `User`
--

DROP TABLE IF EXISTS `User`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `User` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `roleId` int NOT NULL,
  `territoryId` int DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `User_email_key` (`email`),
  KEY `User_roleId_fkey` (`roleId`),
  KEY `User_territoryId_fkey` (`territoryId`),
  CONSTRAINT `User_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `Role` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `User_territoryId_fkey` FOREIGN KEY (`territoryId`) REFERENCES `Territory` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `User`
--

LOCK TABLES `User` WRITE;
/*!40000 ALTER TABLE `User` DISABLE KEYS */;
INSERT INTO `User` VALUES (1,'admin@advancetelecom.com','$2b$10$FEtGTycEwi1OvVGWe/fHtOkW.BkqU2FOcDapznVe9EYq1ky3jGDH.','System Admin',1,NULL,'2026-06-24 13:22:59.119','2026-06-24 14:31:51.306'),(2,'tso@advancetelecom.com','$2b$10$/f3pZ8xkoTuKunhi/hAZL.UAODoGyYqTxPvBZX9fAMqgOSfjc9QhS','Ali Jafri',2,1,'2026-06-24 13:22:59.124','2026-06-24 13:22:59.124');
/*!40000 ALTER TABLE `User` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-24 17:47:13
