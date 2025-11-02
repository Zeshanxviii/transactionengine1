import { mysqlTable, varchar, tinyint, text, datetime, timestamp, bigint, int, primaryKey, index, unique } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';

// Channel Users Table
export const itnChannelUsers = mysqlTable('itn_channel_users', {
  userId: varchar('user_id', { length: 20 }).notNull().primaryKey(),
  userName: varchar('user_name', { length: 50 }),
  password: varchar('password', { length: 300 }),
  txnPin: varchar('txn_pin', { length: 200 }),
  invalidPinCount: tinyint('invalid_pin_count'),
  invalidPasswordCount: tinyint('invalid_password_count'),
  categoryCode: varchar('category_code', { length: 10 }),
  userType: varchar('user_type', { length: 20 }),
  firstName: varchar('first_name', { length: 50 }),
  lastName: varchar('last_name', { length: 100 }),
  msisdn: varchar('msisdn', { length: 10 }),
  status: varchar('status', { length: 100 }),
  firmName: varchar('firm_name', { length: 50 }),
  alterMsisdn: varchar('alter_msisdn', { length: 50 }),
  emailId: varchar('email_id', { length: 50 }),
  city: varchar('city', { length: 200 }),
  state: varchar('state', { length: 20 }),
  district: varchar('district', { length: 20 }),
  address: text('address'),
  pan: varchar('pan', { length: 50 }),
  pincode: varchar('pincode', { length: 20 }),
  parentId: varchar('parent_id', { length: 50 }),
  ownerId: varchar('owner_id', { length: 20 }),
  thresProfileId: varchar('thres_profile_id', { length: 20 }),
  joinDate: datetime('join_date'),
  deletedOn: datetime('deleted_on'),
  modifiedOn: timestamp('modified_on').notNull().defaultNow().onUpdateNow(),
  suspensionReason: varchar('suspension_reason', { length: 50 }),
  lastLoginOn: timestamp('last_login_on'),
  firstLogin: varchar('first_login', { length: 2 }),
  suspendReason: text('suspend_reason'),
  manager: varchar('manager', { length: 20 }),
  otpStatus: varchar('otp_status', { length: 2 }),
  dmtType: varchar('dmt_type', { length: 20 }),
  panFilePath: varchar('pan_file_path', { length: 500 }),
  aadharFilePath: varchar('aadhar_file_path', { length: 500 }),
  gstNumber: varchar('gst_number', { length: 50 }),
  aadhaar: varchar('aadhaar', { length: 50 }),
  incometaxProofName: varchar('incometax_proof_name', { length: 15 }),
  incometaxProofId: varchar('incometax_proof_id', { length: 30 }),
  incometaxProofFile: varchar('incometax_proof_file', { length: 150 }),
  servicetaxProofName: varchar('servicetax_proof_name', { length: 15 }),
  servicetaxProofId: varchar('servicetax_proof_id', { length: 30 }),
  servicetaxProofFile: varchar('servicetax_proof_file', { length: 150 }),
  idProofName: varchar('id_proof_name', { length: 15 }),
  idProofId: varchar('id_proof_id', { length: 30 }),
  idProofFile: varchar('id_proof_file', { length: 150 }),
  addressProofName: varchar('address_proof_name', { length: 15 }),
  addressProofId: varchar('address_proof_id', { length: 30 }),
  addressProofFile: varchar('address_proof_file', { length: 150 }),
});

// Default Threshold Table
export const itnDefaultThreshold = mysqlTable('itn_default_threshold', {
  setDefaultId: varchar('set_default_id', { length: 20 }).notNull().primaryKey(),
  thresProfileId: varchar('thres_profile_id', { length: 20 }),
  thresholdName: varchar('threshold_name', { length: 20 }),
  userType: varchar('user_type', { length: 20 }),
  categoryCode: varchar('category_code', { length: 20 }),
  status: varchar('status', { length: 1 }),
});

// Money Transfer Service Charge Table
export const itnMnytfrSrvchrg = mysqlTable('itn_mnytfr_srvchrg', {
  srvcChrgId: varchar('srvc_chrg_id', { length: 20 }).notNull().primaryKey(),
  srvcChrgVer: int('srvc_chrg_ver'),
  minTfrAmt: bigint('min_tfr_amt', { mode: 'number' }),
  maxTfrAmt: bigint('max_tfr_amt', { mode: 'number' }),
  mode: varchar('mode', { length: 5 }),
  srvcChrgDtlsId: varchar('srvc_chrg_dtls_id', { length: 20 }),
  createdOn: timestamp('created_on').notNull().defaultNow().onUpdateNow(),
  status: varchar('status', { length: 2 }),
});

// Money Transfer Service Charge Details Table
export const itnMnytfrSrvcrhgDtls = mysqlTable('itn_mnytfr_srvchrg_dtls', {
  srvcChrgDtlsId: varchar('srvc_chrg_dtls_id', { length: 20 }).notNull(),
  fromAmt: bigint('from_amt', { mode: 'number' }).notNull().default(0),
  toAmt: bigint('to_amt', { mode: 'number' }).notNull().default(0),
  type: varchar('type', { length: 15 }),
  usrCtgry1: varchar('usr_ctgry_1', { length: 20 }),
  srvcAmt1: bigint('srvc_amt_1', { mode: 'number' }),
  usrCtgry2: varchar('usr_ctgry_2', { length: 20 }),
  srvcAmt2: bigint('srvc_amt_2', { mode: 'number' }),
  usrCtgry3: varchar('usr_ctgry_3', { length: 20 }),
  srvcAmt3: bigint('srvc_amt_3', { mode: 'number' }),
  usrCtgry4: varchar('usr_ctgry_4', { length: 20 }),
  srvcAmt4: bigint('srvc_amt_4', { mode: 'number' }),
  usrCtgry5: varchar('usr_ctgry_5', { length: 20 }),
  srvcAmt5: bigint('srvc_amt_5', { mode: 'number' }),
  status: varchar('status', { length: 2 }),
}, (table) => ({
  pk: primaryKey({ columns: [table.srvcChrgDtlsId, table.fromAmt, table.toAmt] }),
}));

// Product Profile Table
export const itnProductProfile = mysqlTable('itn_product_profile', {
  productId: varchar('productId', { length: 20 }).notNull(),
  productType: varchar('product_type', { length: 20 }).notNull(),
  serviceProvider: varchar('service_provider', { length: 75 }).notNull(),
  rechargeType: varchar('recharge_type', { length: 50 }).notNull(),
  productCode: varchar('product_code', { length: 50 }).notNull(),
  api: varchar('api', { length: 20 }).notNull(),
  marginType: varchar('marginType', { length: 20 }),
  margin: bigint('margin', { mode: 'number' }),
  status: varchar('status', { length: 1 }),
  modifiedOn: timestamp('modifiedOn').notNull().defaultNow().onUpdateNow(),
}, (table) => ({
  pk: primaryKey({ columns: [table.productType, table.serviceProvider, table.rechargeType, table.productCode, table.api] }),
}));

// Product Commissions Table
export const itnProductCommissions = mysqlTable('itn_product_commissions', {
  productId: varchar('product_id', { length: 20 }).notNull(),
  productType: varchar('product_type', { length: 20 }).notNull(),
  serviceProvider: varchar('service_provider', { length: 75 }).notNull(),
  rechargeType: varchar('recharge_type', { length: 50 }).notNull(),
  userType: varchar('user_type', { length: 10 }).notNull(),
  userCategory: varchar('user_category', { length: 5 }).notNull(),
  commissionType: varchar('commissionType', { length: 20 }),
  commissionDirection: varchar('commissionDirection', { length: 20 }).notNull(),
  commission: bigint('commission', { mode: 'number' }),
  createdOn: datetime('createdOn'),
  modifiedOn: timestamp('modifiedOn').notNull().defaultNow().onUpdateNow(),
  status: varchar('status', { length: 300 }),
}, (table) => ({
  pk: primaryKey({ columns: [table.productId, table.productType, table.serviceProvider, table.rechargeType, table.userType, table.userCategory] }),
}));

// Service Charge Table
export const itnServiceCharge = mysqlTable('itn_service_charge', {
  srvcChrgId: varchar('srvc_chrg_id', { length: 20 }).notNull().primaryKey(),
  serviceType: varchar('service_type', { length: 100 }),
  srvcChrgType: varchar('srvc_chrg_type', { length: 10 }),
  serviceCharge: varchar('service_charge', { length: 10 }),
  payer: varchar('payer', { length: 10 }),
  productId: varchar('productId', { length: 20 }),
  productType: varchar('product_type', { length: 20 }),
  serviceProvider: varchar('service_provider', { length: 75 }),
  rechargeType: varchar('recharge_type', { length: 50 }),
  createdOn: datetime('created_on'),
  modifiedOn: timestamp('modified_on').notNull().defaultNow().onUpdateNow(),
  status: varchar('status', { length: 2 }),
});

// Service Charge Details Table
export const itnServiceChargeDetails = mysqlTable('itn_service_charge_details', {
  detailId: varchar('detail_id', { length: 20 }).notNull(),
  version: int('version'),
  serviceType: varchar('service_type', { length: 100 }),
  productType: varchar('product_type', { length: 20 }),
  serviceProvider: varchar('service_provider', { length: 75 }),
  rechargeType: varchar('recharge_type', { length: 50 }),
  userCategory: varchar('user_category', { length: 50 }).notNull(),
  srvcChrgType: varchar('srvc_chrg_type', { length: 10 }),
  serviceCharge: bigint('service_charge', { mode: 'number' }),
  status: varchar('status', { length: 2 }),
}, (table) => ({
  pk: primaryKey({ columns: [table.detailId, table.userCategory] }),
}));

// Service Charge Profile Table
export const itnServiceChargeProfile = mysqlTable('itn_service_charge_profile', {
  profileId: varchar('profile_id', { length: 20 }).notNull(),
  version: int('version').notNull().default(0),
  detailId: varchar('detail_id', { length: 20 }),
  createdOn: timestamp('created_on').notNull().defaultNow().onUpdateNow(),
  modifiedOn: timestamp('modified_on').notNull().defaultNow().onUpdateNow(),
  status: varchar('status', { length: 2 }),
}, (table) => ({
  pk: primaryKey({ columns: [table.profileId, table.version] }),
}));

// Transaction Header Table
export const itnTransactionHeader = mysqlTable('itn_transaction_header', {
  transferId: varchar('transfer_id', { length: 20 }).notNull().primaryKey(),
  transferOn: datetime('transfer_on'),
  payerUserId: varchar('payer_user_id', { length: 20 }),
  payerAccountId: varchar('payer_account_id', { length: 20 }),
  payeeUserId: varchar('payee_user_id', { length: 20 }),
  payeeAccountId: varchar('payee_account_id', { length: 20 }),
  requestedValue: bigint('requested_value', { mode: 'number' }),
  errorCode: varchar('error_code', { length: 20 }),
  transferStatus: varchar('transfer_status', { length: 20 }),
  serviceType: varchar('service_type', { length: 20 }),
  productId: varchar('product_id', { length: 30 }),
  serviceProvider: varchar('service_provider', { length: 75 }),
  productType: varchar('product_type', { length: 20 }),
  rechargeType: varchar('recharge_type', { length: 20 }),
  reconciliationDone: varchar('reconciliation_done', { length: 20 }),
  reconciliationDate: varchar('reconciliation_date', { length: 20 }),
  reconciliationBy: varchar('reconciliation_by', { length: 20 }),
  details1: varchar('details_1', { length: 150 }),
  details2: varchar('details_2', { length: 150 }),
  details3: varchar('details_3', { length: 150 }),
  details4: varchar('details_4', { length: 150 }),
  details5: varchar('details_5', { length: 150 }),
  createdBy: varchar('created_by', { length: 20 }),
  createdOn: varchar('created_on', { length: 20 }),
  modifiedBy: varchar('modified_by', { length: 20 }),
  modifiedOn: timestamp('modified_on').notNull().defaultNow().onUpdateNow(),
  remarks: text('remarks'),
  totalCommission: bigint('total_commission', { mode: 'number' }),
  admnSrvcChrg: bigint('admn_srvc_chrg', { mode: 'number' }),
  distSrvcChrg: bigint('dist_srvc_chrg', { mode: 'number' }),
  rtlrSrvcChrg: bigint('rtlr_srvc_chrg', { mode: 'number' }),
  totalServiceCharge: bigint('total_service_charge', { mode: 'number' }),
  operatorTxnId: varchar('operator_txn_id', { length: 30 }),
  aggregatorTxnId: varchar('aggregator_txn_id', { length: 30 }),
  details6: varchar('details_6', { length: 100 }),
  details7: varchar('details_7', { length: 100 }),
  details8: varchar('details_8', { length: 100 }),
  details9: varchar('details_9', { length: 100 }),
  details10: varchar('details_10', { length: 100 }),
  taxDetails1: bigint('tax_details_1', { mode: 'number' }),
  taxDetails2: bigint('tax_details_2', { mode: 'number' }),
  taxDetails3: bigint('tax_details_3', { mode: 'number' }),
  taxDetails4: bigint('tax_details_4', { mode: 'number' }),
  taxDetails5: bigint('tax_details_5', { mode: 'number' }),
  taxDetails6: bigint('tax_details_6', { mode: 'number' }),
  taxDetails7: bigint('tax_details_7', { mode: 'number' }),
  taxDetails8: bigint('tax_details_8', { mode: 'number' }),
  aggregatorStatus: varchar('aggregator_status', { length: 2 }),
  dmtApi: varchar('dmt_api', { length: 100 }),
}, (table) => ({
  indexDetailsN: index('index_details_n').on(table.details1, table.details2, table.details3, table.details4, table.details5),
}));

// Transaction Items Table
export const itnTransactionItems = mysqlTable('itn_transaction_items', {
  transferId: varchar('transfer_id', { length: 20 }).notNull(),
  transferOn: timestamp('transfer_on').notNull().defaultNow().onUpdateNow(),
  transferStatus: varchar('transfer_status', { length: 20 }),
  partyId: varchar('party_id', { length: 20 }).notNull(),
  secondParty: varchar('second_party', { length: 20 }).notNull(),
  userType: varchar('user_type', { length: 20 }),
  userCategory: varchar('user_category', { length: 50 }),
  transactionType: varchar('transaction_type', { length: 50 }).notNull(),
  approvedValue: bigint('approved_value', { mode: 'number' }),
  serviceType: varchar('service_type', { length: 50 }),
  productId: varchar('product_id', { length: 30 }),
  serviceProvider: varchar('service_provider', { length: 75 }),
  productType: varchar('product_type', { length: 20 }),
  rechargeType: varchar('recharge_type', { length: 20 }),
  previousBalance: bigint('previous_balance', { mode: 'number' }),
  postBalance: bigint('post_balance', { mode: 'number' }),
}, (table) => ({
  pk: primaryKey({ columns: [table.transferId, table.partyId, table.secondParty, table.transactionType] }),
  idxTxnitmSrvctyp: index('idx_txnitm_srvctyp').on(table.serviceType),
}));

// Thresholds Profiles Table
export const itnThresholdsProfiles = mysqlTable('itn_thresholds_profiles', {
  thresProfileId: varchar('thres_profile_id', { length: 20 }).notNull().primaryKey(),
  name: varchar('name', { length: 20 }),
  userType: varchar('user_type', { length: 20 }),
  status: varchar('status', { length: 1 }),
});

// Thresholds Profile Details Table
export const itnThresholdsProfileDtls = mysqlTable('itn_thresholds_profile_dtls', {
  thresProfileDtlsId: varchar('thres_profile_dtls_id', { length: 20 }).notNull().primaryKey(),
  thresProfileId: varchar('thres_profile_id', { length: 20 }),
  groupId: varchar('group_id', { length: 20 }),
  payerCount: bigint('payer_count', { mode: 'number' }),
  payerAmt: bigint('payer_amt', { mode: 'number' }),
  payeeCount: bigint('payee_count', { mode: 'number' }),
  payeeAmt: bigint('payee_amt', { mode: 'number' }),
}, (table) => ({
  thresProfileGroupId: unique('thres_profile_group_id').on(table.thresProfileId, table.groupId),
}));

// Wallet Table
export const itnWallet = mysqlTable('itn_wallet', {
  walletId: varchar('wallet_id', { length: 20 }).notNull().primaryKey(),
  userId: varchar('user_id', { length: 20 }),
  userType: varchar('user_type', { length: 20 }),
  msisdn: varchar('msisdn', { length: 15 }),
  walletType: varchar('wallet_type', { length: 20 }),
  prevBalance: bigint('prev_balance', { mode: 'number' }),
  balance: bigint('balance', { mode: 'number' }),
  netCredit: bigint('net_credit', { mode: 'number' }),
  netDebit: bigint('net_debit', { mode: 'number' }),
  lastTransationType: varchar('last_transation_type', { length: 50 }),
  lastTransationId: varchar('last_transation_id', { length: 20 }),
  status: varchar('status', { length: 2 }),
  walletLimit: bigint('wallet_limit', { mode: 'number' }),
  lastTransationOn: datetime('last_transation_on'),
  operatorCode: varchar('operator_Code', { length: 100 }),
  firstTransationOn: datetime('first_transation_on'),
});

// System Service Types Table
export const sysServiceTypes = mysqlTable('sys_service_types', {
  serviceType: varchar('service_type', { length: 20 }).notNull().primaryKey(),
  serviceName: varchar('service_name', { length: 100 }),
  status: varchar('status', { length: 2 }),
  isFinancial: varchar('is_financial', { length: 2 }),
});

// System Product Profiles Table
export const sysProductProfiles = mysqlTable('sys_product_profiles', {
  productId: varchar('product_id', { length: 20 }).notNull().primaryKey(),
  productType: varchar('product_type', { length: 20 }),
  serviceProvider: varchar('service_provider', { length: 75 }),
  rechargeType: varchar('recharge_type', { length: 20 }),
  productCode: varchar('product_code', { length: 20 }),
  api: varchar('api', { length: 20 }),
  status: varchar('status', { length: 20 }),
  createdOn: datetime('created_on'),
  imageUrl: text('image_url'),
});

// Relations
export const itnChannelUsersRelations = relations(itnChannelUsers, ({ many, one }) => ({
  wallets: many(itnWallet),
  thresholdProfile: one(itnThresholdsProfiles, {
    fields: [itnChannelUsers.thresProfileId],
    references: [itnThresholdsProfiles.thresProfileId],
  }),
}));

export const itnWalletRelations = relations(itnWallet, ({ one }) => ({
  user: one(itnChannelUsers, {
    fields: [itnWallet.userId],
    references: [itnChannelUsers.userId],
  }),
}));

export const itnTransactionHeaderRelations = relations(itnTransactionHeader, ({ many }) => ({
  items: many(itnTransactionItems),
}));

export const itnTransactionItemsRelations = relations(itnTransactionItems, ({ one }) => ({
  header: one(itnTransactionHeader, {
    fields: [itnTransactionItems.transferId],
    references: [itnTransactionHeader.transferId],
  }),
}));

export const itnThresholdsProfilesRelations = relations(itnThresholdsProfiles, ({ many }) => ({
  details: many(itnThresholdsProfileDtls),
  users: many(itnChannelUsers),
}));

export const itnThresholdsProfileDtlsRelations = relations(itnThresholdsProfileDtls, ({ one }) => ({
  profile: one(itnThresholdsProfiles, {
    fields: [itnThresholdsProfileDtls.thresProfileId],
    references: [itnThresholdsProfiles.thresProfileId],
  }),
}));