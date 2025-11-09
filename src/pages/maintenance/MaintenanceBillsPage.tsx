import { useState, useEffect } from 'react';
import { Card, Table, Tag, Select, Space, message, Statistic, Row, Col } from 'antd';
import { DollarOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { getMaintenanceBills } from '../../apis/maintenance';

const MaintenanceBillsPage = () => {
    const [loading, setLoading] = useState(false);
    const [bills, setBills] = useState([]);
    const [filterMonth, setFilterMonth] = useState<number | undefined>(undefined);
    const [filterYear, setFilterYear] = useState<number>(new Date().getFullYear());
    const [filterStatus, setFilterStatus] = useState<string | undefined>(undefined);

    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const buildingId = userInfo.buildingId;

    useEffect(() => {
        if (buildingId) {
            fetchBills();
        }
    }, [buildingId, filterMonth, filterYear, filterStatus]);

    const fetchBills = async () => {
        try {
            setLoading(true);
            const params: any = { buildingId };
            if (filterMonth) params.month = filterMonth;
            if (filterYear) params.year = filterYear;
            if (filterStatus !== undefined) params.isPaid = filterStatus;

            const response = await getMaintenanceBills(params);
            setBills(response.data);
        } catch (error: any) {
            message.error(error.message || 'Failed to fetch bills');
        } finally {
            setLoading(false);
        }
    };

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Calculate stats
    const totalBills = bills.length;
    const paidBills = bills.filter((b: any) => b.isPaid).length;
    const unpaidBills = totalBills - paidBills;
    const totalAmount = bills.reduce((sum: number, b: any) => sum + (b.amount || 0), 0);
    const paidAmount = bills.filter((b: any) => b.isPaid).reduce((sum: number, b: any) => sum + (b.amount || 0), 0);
    const unpaidAmount = totalAmount - paidAmount;

    const columns = [
        {
            title: 'Bill Period',
            key: 'period',
            render: (_: any, record: any) => `${monthNames[record.month - 1]} ${record.year}`,
            sorter: (a: any, b: any) => {
                if (a.year !== b.year) return b.year - a.year;
                return b.month - a.month;
            }
        },
        {
            title: 'Unit',
            dataIndex: ['unitId', 'unitNumber'],
            key: 'unitNumber',
            sorter: (a: any, b: any) => (a.unitId?.unitNumber || '').localeCompare(b.unitId?.unitNumber || '')
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
            render: (amount: number) => `₹${amount?.toLocaleString() || 0}`,
            sorter: (a: any, b: any) => (a.amount || 0) - (b.amount || 0)
        },
        {
            title: 'Due Date',
            dataIndex: 'dueDate',
            key: 'dueDate',
            render: (date: string) => new Date(date).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            }),
            sorter: (a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        },
        {
            title: 'Status',
            dataIndex: 'isPaid',
            key: 'isPaid',
            render: (isPaid: boolean) => (
                <Tag color={isPaid ? 'green' : 'orange'} icon={isPaid ? <CheckCircleOutlined /> : <ClockCircleOutlined />}>
                    {isPaid ? 'PAID' : 'PENDING'}
                </Tag>
            ),
            filters: [
                { text: 'Paid', value: true },
                { text: 'Pending', value: false }
            ],
            onFilter: (value: any, record: any) => record.isPaid === value
        },
        {
            title: 'Payment Date',
            dataIndex: 'paidDate',
            key: 'paidDate',
            render: (date: string) => date ? new Date(date).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            }) : '-',
            sorter: (a: any, b: any) => {
                if (!a.paidDate) return 1;
                if (!b.paidDate) return -1;
                return new Date(a.paidDate).getTime() - new Date(b.paidDate).getTime();
            }
        },
        {
            title: 'Payment Method',
            dataIndex: 'paymentMethod',
            key: 'paymentMethod',
            render: (method: string) => method ? method.toUpperCase() : '-'
        },
        {
            title: 'Transaction ID',
            dataIndex: 'transactionId',
            key: 'transactionId',
            render: (txnId: string) => txnId || '-'
        }
    ];

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Maintenance Bills</h1>
                <p className="text-gray-500">View all maintenance bills and payment status</p>
            </div>

            {/* Statistics */}
            <Row gutter={16} className="mb-6">
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Total Bills"
                            value={totalBills}
                            prefix={<DollarOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Paid Bills"
                            value={paidBills}
                            valueStyle={{ color: '#3f8600' }}
                            prefix={<CheckCircleOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Pending Bills"
                            value={unpaidBills}
                            valueStyle={{ color: '#cf1322' }}
                            prefix={<ClockCircleOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Collection Rate"
                            value={totalBills > 0 ? ((paidBills / totalBills) * 100).toFixed(1) : 0}
                            suffix="%"
                            valueStyle={{ color: totalBills > 0 && paidBills / totalBills > 0.7 ? '#3f8600' : '#cf1322' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={16} className="mb-6">
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="Total Amount"
                            value={totalAmount}
                            prefix="₹"
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="Amount Collected"
                            value={paidAmount}
                            prefix="₹"
                            valueStyle={{ color: '#3f8600' }}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="Amount Pending"
                            value={unpaidAmount}
                            prefix="₹"
                            valueStyle={{ color: '#cf1322' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Filters */}
            <Card className="mb-4">
                <Space>
                    <Select
                        placeholder="Filter by Month"
                        style={{ width: 150 }}
                        allowClear
                        value={filterMonth}
                        onChange={setFilterMonth}
                    >
                        {monthNames.map((month, index) => (
                            <Select.Option key={index + 1} value={index + 1}>
                                {month}
                            </Select.Option>
                        ))}
                    </Select>
                    <Select
                        placeholder="Filter by Year"
                        style={{ width: 120 }}
                        value={filterYear}
                        onChange={setFilterYear}
                    >
                        {[2024, 2025, 2026].map(year => (
                            <Select.Option key={year} value={year}>
                                {year}
                            </Select.Option>
                        ))}
                    </Select>
                    <Select
                        placeholder="Filter by Status"
                        style={{ width: 150 }}
                        allowClear
                        value={filterStatus}
                        onChange={setFilterStatus}
                    >
                        <Select.Option value="true">Paid</Select.Option>
                        <Select.Option value="false">Pending</Select.Option>
                    </Select>
                </Space>
            </Card>

            {/* Bills Table */}
            <Card>
                <Table
                    loading={loading}
                    dataSource={bills}
                    columns={columns}
                    rowKey="_id"
                    pagination={{ pageSize: 20 }}
                    scroll={{ x: 1200 }}
                />
            </Card>
        </div>
    );
};

export default MaintenanceBillsPage;
