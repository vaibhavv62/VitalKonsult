import { useEffect, useState } from 'react';
import api from '../api';

const AttendanceList = () => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendanceData, setAttendanceData] = useState([]); // Raw records
    const [groupedBatches, setGroupedBatches] = useState({}); // { batchId: { info: {}, records: [] } }
    const [loading, setLoading] = useState(false);
    const [expandedBatch, setExpandedBatch] = useState(null);

    useEffect(() => {
        fetchAttendance();
    }, [date]);

    const fetchAttendance = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/attendance/?date=${date}`);
            processAttendanceData(response.data);
        } catch (error) {
            console.error("Failed to fetch attendance", error);
        } finally {
            setLoading(false);
        }
    };

    const processAttendanceData = (records) => {
        const groups = {};
        records.forEach(record => {
            if (!groups[record.batch]) {
                groups[record.batch] = {
                    batchName: record.batch_name,
                    topic: record.topic_taught,
                    remarks: record.remarks,
                    present: 0,
                    absent: 0,
                    records: []
                };
            }
            groups[record.batch].records.push(record);
            if (record.status === 'PRESENT_ONLINE' || record.status === 'PRESENT_OFFLINE' || record.status === 'PRESENT') {
                groups[record.batch].present += 1;
            } else {
                groups[record.batch].absent += 1;
            }
        });
        setGroupedBatches(groups);
    };

    const toggleExpand = (batchId) => {
        setExpandedBatch(expandedBatch === batchId ? null : batchId);
    };

    return (
        <div className="p-4 md:p-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-6">Attendance History</h1>

            <div className="mb-6">
                <label className="block text-gray-700 font-bold mb-2">Select Date</label>
                <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="border p-2 rounded"
                />
            </div>

            {loading ? (
                <div>Loading...</div>
            ) : (
                <div className="space-y-4">
                    {Object.keys(groupedBatches).length === 0 && (
                        <p className="text-gray-500">No attendance records found for this date.</p>
                    )}

                    {Object.entries(groupedBatches).map(([batchId, group]) => (
                        <div key={batchId} className="bg-white shadow rounded-lg overflow-hidden border">
                            <div
                                className="p-3 md:p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2"
                                onClick={() => toggleExpand(batchId)}
                            >
                                <div>
                                    <h3 className="text-base md:text-lg font-bold text-blue-600">{group.batchName}</h3>
                                    <p className="text-xs md:text-sm text-gray-600">Topic: {group.topic || 'N/A'}</p>
                                </div>
                                <div className="flex gap-2 md:gap-4 text-xs md:text-sm">
                                    <span className="text-green-600 font-bold">Present: {group.present}</span>
                                    <span className="text-red-600 font-bold">Absent: {group.absent}</span>
                                    <span className="text-gray-400">{expandedBatch === batchId ? '▲' : '▼'}</span>
                                </div>
                            </div>

                            {expandedBatch === batchId && (
                                <div className="p-3 md:p-4 border-t overflow-x-auto">
                                    {group.remarks && (
                                        <div className="mb-4 p-2 bg-yellow-50 text-yellow-800 rounded text-xs md:text-sm">
                                            <strong>Remarks:</strong> {group.remarks}
                                        </div>
                                    )}
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {group.records.map(record => (
                                                <tr key={record.id}>
                                                    <td className="px-4 py-2 whitespace-nowrap">{record.student_name}</td>
                                                    <td className="px-4 py-2 whitespace-nowrap">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                                    ${record.status === 'PRESENT_ONLINE' ? 'bg-blue-100 text-blue-800' :
                                                                record.status === 'PRESENT_OFFLINE' ? 'bg-green-100 text-green-800' :
                                                                    record.status === 'PRESENT' ? 'bg-green-100 text-green-800' :
                                                                        'bg-red-100 text-red-800'}`}>
                                                            {record.status.replace('PRESENT_', '')}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-2 whitespace-nowrap text-gray-500">{record.lecture_time || '-'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AttendanceList;
