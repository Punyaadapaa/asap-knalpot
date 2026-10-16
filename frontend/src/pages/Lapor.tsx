import React from 'react';
import { LocationItem, SymptomItem, SubmitReportResponse } from '../types';
import { ReportForm } from '../components/ReportForm';

interface LaporProps {
    locations: LocationItem[];
    symptoms: SymptomItem[];
    defaultLocationId?: string;
    onReportSuccess: (data: SubmitReportResponse['data']) => void;
    onCancel: () => void;
}

export const Lapor: React.FC<LaporProps> = ({
    locations,
    symptoms,
    defaultLocationId,
    onReportSuccess,
    onCancel,
}) => {
    return (
        <div className="py-2 pb-16 animate-in fade-in duration-150">
            <ReportForm
                locations={locations}
                symptoms={symptoms}
                defaultLocationId={defaultLocationId}
                onReportSuccess={onReportSuccess}
                onCancel={onCancel}
            />
        </div>
    );
};
