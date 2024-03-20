CREATE TABLE `tblqlnv` (
  `ID` int NOT NULL,
  `FullName` varchar(100) DEFAULT NULL,
  `Age` int DEFAULT NULL,
  `Address` varchar(255) DEFAULT NULL,
  `Email` varchar(100) DEFAULT NULL,
  `StartDate` date DEFAULT NULL,
  `ContractDocument` blob
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
ALTER TABLE tblqlnv
ADD COLUMN RemainingLeaveDays INT DEFAULT 20;
ALTER TABLE tblqlnv
ADD COLUMN password VARCHAR(255);
ALTER TABLE tblqlnv ADD COLUMN role ENUM('admin', 'employee') DEFAULT 'employee';

-- ALTER TABLE tblqlnv
-- ADD COLUMN MaxLeaveDays INT DEFAULT 20;

-- ALTER TABLE tblqlnv
-- ADD COLUMN RemainingLeaveDays INT;

ALTER TABLE tblqlnv
ADD COLUMN RemainingLeaveDays INT DEFAULT 20;







