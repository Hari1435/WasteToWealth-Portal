import React from 'react';
import LoadingSpinner from './LoadingSpinner';
import { InlineTractorLoader, CardTractorLoader } from './TractorLoader';
import { DashboardSkeleton, ListingsSkeleton, FormSkeleton } from './SkeletonLoader';

const PageLoader = ({
    type = 'spinner',
    message = 'Loading...',
    className = ''
}) => {
    const renderLoader = () => {
        switch (type) {
            case 'dashboard':
                return <DashboardSkeleton />;
            case 'listings':
                return <ListingsSkeleton />;
            case 'form':
                return <FormSkeleton />;
            case 'tractor':
                return <InlineTractorLoader size={150} message={message} showMessage={true} />;
            case 'tractor-card':
                return <CardTractorLoader message={message} />;
            case 'spinner':
            default:
                return (
                    <div className="flex items-center justify-center py-12">
                        <LoadingSpinner
                            size="lg"
                            color="primary"
                            message={message}
                        />
                    </div>
                );
        }
    };

    return (
        <div className={`animate-fade-in ${className}`}>
            {renderLoader()}
        </div>
    );
};

// Specific page loaders
export const DashboardLoader = ({ className = '' }) => (
    <PageLoader type="dashboard" className={className} />
);

export const ListingsLoader = ({ className = '' }) => (
    <PageLoader type="listings" className={className} />
);

export const FormLoader = ({ className = '' }) => (
    <PageLoader type="form" className={className} />
);

export const SpinnerLoader = ({ message = 'Loading...', className = '' }) => (
    <PageLoader type="spinner" message={message} className={className} />
);

export const TractorPageLoader = ({ message = 'Loading...', className = '' }) => (
    <PageLoader type="tractor" message={message} className={className} />
);

export const TractorCardLoader = ({ message = 'Loading...', className = '' }) => (
    <PageLoader type="tractor-card" message={message} className={className} />
);

export default PageLoader;