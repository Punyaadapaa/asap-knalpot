import React from 'react';
import { SubmitReportResponse } from '../types';
import { TriageResult } from '../components/TriageResult';

interface TriaseProps {
    reportData: SubmitReportResponse['data'];
    onViewMap: () => void;
    onReset: () => void;
}

export const Triase: React.FC<TriaseProps> = ({
    reportData,
    onViewMap,
    onReset,
}) => {
    return (
        <div className="py-2 pb-16 animate-in fade-in duration-200">
            <TriageResult
                triage={reportData.triage}
                locationName={reportData.location.nama}
                onViewMap={onViewMap}
                onReset={onReset}
            />
        </div>
    );
};
