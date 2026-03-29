import React, { useState } from 'react';
import LoadingSpinner from './LoadingSpinner';
import InlineLoader, { CardLoader, TableLoader, ButtonLoader } from './InlineLoader';
import PageLoader, { DashboardLoader, SpinnerLoader, TractorPageLoader, TractorCardLoader } from './PageLoader';
import TractorLoader, { FullScreenTractorLoader, InlineTractorLoader, CardTractorLoader } from './TractorLoader';
import Button from './Button';

// Example component showing all loader types
const LoaderExamples = () => {
  const [buttonLoading, setButtonLoading] = useState(false);
  const [showPageLoader, setShowPageLoader] = useState(false);
  const [showFullScreenTractor, setShowFullScreenTractor] = useState(false);

  const handleButtonClick = async () => {
    setButtonLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setButtonLoading(false);
  };

  const togglePageLoader = () => {
    setShowPageLoader(!showPageLoader);
  };

  return (
    <div className="space-y-8 p-6">
      <h1 className="text-2xl font-bold text-gray-900">Loader Examples</h1>

      {/* Tractor Loaders - NEW! */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">🚜 Tractor Loaders (Agricultural Theme)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-sm font-medium mb-4">Basic Tractor</h3>
            <TractorLoader size={120} showMessage={false} />
          </div>
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-sm font-medium mb-4">With Message</h3>
            <TractorLoader size={120} message="Loading farm data..." />
          </div>
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-sm font-medium mb-4">Fast Animation</h3>
            <TractorLoader size={120} speed={2} showMessage={false} />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg border">
            <h3 className="text-sm font-medium p-4 border-b">Inline Tractor Loader</h3>
            <InlineTractorLoader size={100} message="Processing..." showMessage={true} />
          </div>
          <div className="bg-white rounded-lg border">
            <h3 className="text-sm font-medium p-4 border-b">Card Tractor Loader</h3>
            <div className="p-4">
              <CardTractorLoader message="Loading waste listings..." />
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <Button 
            onClick={() => setShowFullScreenTractor(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            Show Full Screen Tractor
          </Button>
        </div>
      </section>

      {/* Basic Spinners */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Basic Spinners</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-sm font-medium mb-2">Small</h3>
            <LoadingSpinner size="sm" />
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-sm font-medium mb-2">Medium</h3>
            <LoadingSpinner size="md" />
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-sm font-medium mb-2">Large</h3>
            <LoadingSpinner size="lg" />
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-sm font-medium mb-2">With Message</h3>
            <LoadingSpinner size="md" message="Loading data..." />
          </div>
        </div>
      </section>

      {/* Inline Loaders */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Inline Loaders</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg border">
            <h3 className="text-sm font-medium p-4 border-b">Inline Loader</h3>
            <InlineLoader message="Fetching content..." />
          </div>
          <div className="bg-white rounded-lg border">
            <h3 className="text-sm font-medium p-4 border-b">Card Loader</h3>
            <div className="p-4">
              <CardLoader />
            </div>
          </div>
        </div>
      </section>

      {/* Table Loader */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Table Loader</h2>
        <TableLoader rows={3} columns={4} />
      </section>

      {/* Button Loader */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Button Loader</h2>
        <div className="flex gap-4">
          <ButtonLoader
            loading={buttonLoading}
            onClick={handleButtonClick}
            className="btn-primary"
          >
            {buttonLoading ? 'Processing...' : 'Click to Load'}
          </ButtonLoader>
          <Button onClick={togglePageLoader} variant="outline">
            Toggle Page Loader
          </Button>
        </div>
      </section>

      {/* Tractor Page Loaders */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Tractor Page Loaders</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg border">
            <h3 className="text-sm font-medium p-4 border-b">Tractor Page Loader</h3>
            <TractorPageLoader message="Loading your farm dashboard..." />
          </div>
          <div className="bg-white rounded-lg border">
            <h3 className="text-sm font-medium p-4 border-b">Tractor Card Loader</h3>
            <TractorCardLoader message="Loading waste data..." />
          </div>
        </div>
      </section>

      {/* Page Loaders */}
      {showPageLoader && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Page Loaders</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Dashboard Loader</h3>
              <DashboardLoader />
            </div>
          </div>
        </section>
      )}

      {!showPageLoader && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Page Loader Previews</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg border">
              <h3 className="text-sm font-medium mb-2">Spinner Loader</h3>
              <SpinnerLoader message="Loading page..." />
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <h3 className="text-sm font-medium mb-2">Form Loader Preview</h3>
              <div className="text-center py-8">
                <LoadingSpinner size="md" message="Form loading..." />
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <h3 className="text-sm font-medium mb-2">Listings Loader Preview</h3>
              <div className="text-center py-8">
                <LoadingSpinner size="md" message="Listings loading..." />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Full Screen Tractor Loader */}
      {showFullScreenTractor && (
        <FullScreenTractorLoader message="Demo: Full screen tractor loader!" />
      )}

      {/* Auto-hide full screen loader after 3 seconds */}
      {showFullScreenTractor && setTimeout(() => setShowFullScreenTractor(false), 3000)}
    </div>
  );
};

export default LoaderExamples;