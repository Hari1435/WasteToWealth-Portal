import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Trash2, 
  Eye, 
  Search,
  Package,
  MapPin,
  DollarSign
} from 'lucide-react';
import { wasteAPI } from '../../utils/api';
import { useApiWithLoading } from '../../hooks/useApiWithLoading';
import { formatCurrency, formatDate, getWasteTypeLabel, getWasteTypeColor, getWasteStatusLabel, getWasteStatusColor } from '../../utils/helpers';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';

const MyListings = () => {
  const [listings, setListings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const { callWithLoading } = useApiWithLoading();

  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const fetchListings = useCallback(async () => {
    const params = {
      page: currentPage,
      limit: 12,
      ...(statusFilter !== 'all' && { status: statusFilter })
    };
    
    try {
      if (isInitialLoad) {
        // Show tractor loading for initial load
        const response = await callWithLoading(
          () => wasteAPI.getMyListings(params),
          'Loading your listings...'
        );
        setListings(response.data.data.wastes);
        setTotalPages(response.data.data.pagination.totalPages);
        setIsInitialLoad(false);
      } else {
        // Show small loading indicator for pagination
        const response = await wasteAPI.getMyListings(params);
        setListings(response.data.data.wastes);
        setTotalPages(response.data.data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error fetching listings:', error);
      // Silent error handling - don't show toast to user
    }
  }, [currentPage, statusFilter, callWithLoading, isInitialLoad]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) {
      return;
    }

    try {
      setDeleteLoading(id);
      await wasteAPI.delete(id);
      toast.success('Listing deleted successfully');
      fetchListings();
    } catch (error) {
      toast.error('Failed to delete listing');
    } finally {
      setDeleteLoading(null);
    }
  };

  const filteredListings = listings.filter(listing =>
    listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.cropSource.toLowerCase().includes(searchTerm.toLowerCase())
  );



  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  return (
    <div className="page-container">
      <div className="container-custom py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              My Waste Listings
            </h1>
            <p className="text-gray-600">
              Manage your agricultural waste listings and track their performance
            </p>
          </div>
          <Link to="/farmer/create-listing">
            <Button className="mt-4 md:mt-0">
              <Plus size={20} />
              Create New Listing
            </Button>
          </Link>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search listings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="input-field"
              >
                <option value="all">All Status</option>
                <option value="available">Available</option>
                <option value="sold_out">Sold Out</option>
                <option value="reserved">Reserved</option>
                <option value="sold">Sold</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>
        </div>

        {/* Listings Grid */}
        {filteredListings.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {filteredListings.map((listing) => (
                <div key={listing._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                  {/* Image */}
                  <div className="relative h-48 bg-gray-200">
                    {listing.images && listing.images.length > 0 ? (
                      <img
                        src={listing.images[0]}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package size={48} className="text-gray-400" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getWasteStatusColor(listing.status)}`}>
                        {getWasteStatusLabel(listing.status)}
                      </span>
                    </div>
                    <div className="absolute top-3 left-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getWasteTypeColor(listing.wasteType)}`}>
                        {getWasteTypeLabel(listing.wasteType)}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {listing.title}
                    </h3>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Package size={16} className="mr-2" />
                        {listing.quantity.amount} {listing.quantity.unit} • {listing.cropSource}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <DollarSign size={16} className="mr-2" />
                        {formatCurrency(listing.pricePerUnit)}/{listing.quantity.unit}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin size={16} className="mr-2" />
                        {listing.location.city}, {listing.location.state}
                      </div>

                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <span className="text-sm text-gray-500">
                        {formatDate(listing.createdAt)}
                      </span>
                      <div className="flex space-x-2">
                        <Link to={`/waste/${listing._id}`}>
                          <button className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                            <Eye size={16} />
                          </button>
                        </Link>

                        <button
                          onClick={() => handleDelete(listing._id)}
                          disabled={deleteLoading === listing._id}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                
                <div className="flex space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === page
                          ? 'bg-primary-600 text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <Package size={64} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || statusFilter !== 'all' ? 'No listings found' : 'No listings yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Create your first waste listing to start selling'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <Link to="/farmer/create-listing">
                <Button>
                  <Plus size={20} />
                  Create Your First Listing
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyListings;