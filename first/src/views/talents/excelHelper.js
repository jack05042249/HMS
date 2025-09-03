import moment from 'moment';

const generateTableHeaders = () => {
  const headers = [];

  headers.push(
    'Full Name',
    'Project Name',
    'Position',
    'Agency',
    'Stakeholder',
    'Customers',
    'Start Date',
    'Birthday',
    'Location',
    'Email',
    'Phone Number',
    'Address',
    'Telegram',
    'Whatsup',
    'Summary',
    'Main Stakeholder',
    'Can Work On Two Positions',
    'Linkedin Checked',
    'Linkedin Profile',
    'Inactive',
    'Linkedin Comment'
  );

  return headers;
};

const formatDate = date => {
  return moment(date).format('YYYY-MM-DD');
};

const getTableRowData = (talent, data) => {
  const rowData = [];

  const { organizations, agencies, customers } = data;

  const findAgencyNameById = id => {
    const agencyName = agencies.find(agency => agency.id === id);
    return agencyName ? agencyName.name : null;
  };

  const getRelevantOrganization = id => {
    return organizations.find(org => +org.id === +id);
  };
  const getRelevantCustomer = id => {
    return customers.find(cus => cus.id === id) || {};
  };

  // Add null checks for cusIds
  const cusIds = talent.cusIds || [];
  
  const customerNames = cusIds.map(customerId => getRelevantCustomer(customerId).fullName);
  const uniqueOrganizationNames = [
    ...new Set(
      cusIds.map(customerId => {
        const customer = getRelevantCustomer(customerId);
        const orgz = getRelevantOrganization(customer.organizationId);
        return orgz.name ? orgz.name : '-';
      })
    )
  ];
  rowData.push(
    talent.fullName || '-',
    talent.projectName || '-',
    talent.position || '-',
    findAgencyNameById(talent.agencyId),
    customerNames.join(', '),
    uniqueOrganizationNames.join(', '),
    formatDate(talent.startDate) || '-',
    formatDate(talent.birthday) || '-',
    talent.location || '-',
    talent.email || '-',
    talent.phoneNumber || '-',
    talent.address || '-',
    talent.telegram || '-',
    talent.whatsup || '-',
    talent.summary || '-',
    talent.talentMainCustomer ? getRelevantCustomer(talent.talentMainCustomer)?.fullName || '-' : '-',
    typeof talent.canWorkOnTwoPositions === 'boolean' ? String(talent.canWorkOnTwoPositions) : '-',
    talent.ignoreLinkedinCheck ? 'ignore' : typeof talent.linkedinProfileChecked === 'boolean' ? String(talent.linkedinProfileChecked) : '-',
    talent.linkedinProfile ?? '-',
    typeof talent.inactive === 'boolean' ? String(talent.inactive) : '-',
    talent.linkedinComment ?? '-'
  );

  return rowData;
};

const generateTableData = (talents, data) => {
  const tableData = [];

  // Add safety check for talents array
  if (!talents || !Array.isArray(talents)) {
    return tableData;
  }

  talents.forEach(talent => {
    // Only process talent if it has valid data
    if (talent && typeof talent === 'object') {
      tableData.push(getTableRowData(talent, data));
    }
  });

  return tableData;
};

export { generateTableData, generateTableHeaders, getTableRowData };
