import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  User,
  Phone,
  MapPin,
  Star,
  CheckCircle,
  AlertCircle,
  Heart,
  Shield,
  MessageSquare,
  Filter,
  Search,
  BookOpen,
  Award,
  Users,
  Mail,
  ExternalLink,
  Briefcase
} from 'lucide-react';
import { format, addDays, setHours, setMinutes } from 'date-fns';

const BookAppointment = () => {
  const [selectedService, setSelectedService] = useState('counseling');
  const [selectedCounselor, setSelectedCounselor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(null);
  const [appointmentType, setAppointmentType] = useState('in-person');
  const [appointmentReason, setAppointmentReason] = useState('');
  const [urgency, setUrgency] = useState('routine');
  const [isBooking, setIsBooking] = useState(false);
  const [step, setStep] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('all');

  // Mock data for counselors
  const counselors = [
    {
      id: 1,
      name: 'Dr. Sarah Johnson',
      title: 'Licensed Clinical Psychologist',
      specialties: ['Anxiety', 'Depression', 'Academic Stress'],
      rating: 4.9,
      experience: '8 years',
      availability: 'Mon-Fri',
      location: 'Student Health Center, Room 205',
      phone: '(555) 123-4567',
      email: 's.johnson@university.edu',
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face',
      bio: 'Specialized in helping students navigate academic pressures and mental health challenges.',
      languages: ['English', 'Spanish'],
      insuranceAccepted: true,
      nextAvailable: new Date()
    },
    {
      id: 2,
      name: 'Dr. Michael Chen',
      title: 'Licensed Social Worker',
      specialties: ['Trauma', 'LGBTQ+ Support', 'Crisis Intervention'],
      rating: 4.8,
      experience: '12 years',
      availability: 'Mon-Thu',
      location: 'Counseling Center, Room 102',
      phone: '(555) 123-4568',
      email: 'm.chen@university.edu',
      image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face',
      bio: 'Dedicated to creating safe spaces for students from all backgrounds.',
      languages: ['English', 'Mandarin'],
      insuranceAccepted: true,
      nextAvailable: addDays(new Date(), 1)
    },
    {
      id: 3,
      name: 'Dr. Emily Rodriguez',
      title: 'Clinical Mental Health Counselor',
      specialties: ['Eating Disorders', 'Body Image', 'Substance Abuse'],
      rating: 4.7,
      experience: '6 years',
      availability: 'Tue-Sat',
      location: 'Wellness Center, Room 301',
      phone: '(555) 123-4569',
      email: 'e.rodriguez@university.edu',
      image: 'https://images.unsplash.com/photo-1594824473267-d3c3caeb8a74?w=150&h=150&fit=crop&crop=face',
      bio: 'Passionate about helping students develop healthy relationships with food and their bodies.',
      languages: ['English', 'Spanish'],
      insuranceAccepted: true,
      nextAvailable: addDays(new Date(), 2)
    }
  ];

  // Available time slots
  const generateTimeSlots = (date) => {
    const slots = [];
    for (let hour = 9; hour < 17; hour++) {
      for (let minute of [0, 30]) {
        const time = setMinutes(setHours(new Date(date), hour), minute);
        slots.push({
          time,
          available: Math.random() > 0.3 // Mock availability
        });
      }
    }
    return slots;
  };

  const [availableSlots, setAvailableSlots] = useState([]);

  useEffect(() => {
    if (selectedCounselor && selectedDate) {
      setAvailableSlots(generateTimeSlots(selectedDate));
    }
  }, [selectedCounselor, selectedDate]);

  // Service types
  const services = [
    {
      id: 'counseling',
      name: 'Individual Counseling',
      description: 'One-on-one sessions with licensed mental health professionals',
      duration: '50 minutes',
      cost: 'Free for students'
    },
    {
      id: 'group',
      name: 'Group Therapy',
      description: 'Supportive group sessions focusing on common student challenges',
      duration: '90 minutes',
      cost: 'Free for students'
    },
    {
      id: 'crisis',
      name: 'Crisis Support',
      description: 'Immediate support for urgent mental health concerns',
      duration: 'As needed',
      cost: 'Free for students'
    },
    {
      id: 'psychiatric',
      name: 'Psychiatric Consultation',
      description: 'Medication evaluation and management',
      duration: '30 minutes',
      cost: 'Insurance dependent'
    }
  ];

  // Filter counselors based on search and specialty
  const filteredCounselors = counselors.filter(counselor => {
    const matchesSearch = counselor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         counselor.specialties.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSpecialty = specialtyFilter === 'all' || 
                           counselor.specialties.some(s => s.toLowerCase().includes(specialtyFilter.toLowerCase()));
    return matchesSearch && matchesSpecialty;
  });

  // Handle appointment booking
  const handleBookAppointment = async () => {
    setIsBooking(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert(`Appointment booked successfully with ${selectedCounselor.name} on ${format(selectedDate, 'MMM dd, yyyy')} at ${format(selectedTime, 'h:mm a')}`);
      
      // Reset form
      setStep(1);
      setSelectedCounselor(null);
      setSelectedTime(null);
      setAppointmentReason('');
    } catch (error) {
      alert('Error booking appointment. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  // Service selection step
  const renderServiceSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-secondary-900 mb-2">Choose a Service</h2>
        <p className="text-secondary-600">Select the type of support you're looking for</p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-4">
        {services.map((service) => (
          <button
            key={service.id}
            onClick={() => {
              setSelectedService(service.id);
              setStep(2);
            }}
            className={`p-6 text-left border-2 rounded-xl transition-all hover:shadow-lg ${
              selectedService === service.id
                ? 'border-primary-500 bg-primary-50'
                : 'border-secondary-200 hover:border-primary-300'
            }`}
          >
            <h3 className="text-lg font-semibold text-secondary-900 mb-2">{service.name}</h3>
            <p className="text-sm text-secondary-600 mb-3">{service.description}</p>
            <div className="flex justify-between text-xs text-secondary-500">
              <span><Clock className="h-3 w-3 inline mr-1" />{service.duration}</span>
              <span><Heart className="h-3 w-3 inline mr-1" />{service.cost}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  // Counselor selection step
  const renderCounselorSelection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-secondary-900">Choose a Counselor</h2>
          <p className="text-secondary-600">Select a mental health professional</p>
        </div>
        <button
          onClick={() => setStep(1)}
          className="text-primary-600 hover:text-primary-700 text-sm font-medium"
        >
          ← Back to Services
        </button>
      </div>
      
      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
          <input
            type="text"
            placeholder="Search by name or specialty..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <select
          value={specialtyFilter}
          onChange={(e) => setSpecialtyFilter(e.target.value)}
          className="border border-secondary-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500"
        >
          <option value="all">All Specialties</option>
          <option value="anxiety">Anxiety</option>
          <option value="depression">Depression</option>
          <option value="trauma">Trauma</option>
          <option value="academic">Academic Stress</option>
        </select>
      </div>
      
      <div className="grid gap-6">
        {filteredCounselors.map((counselor) => (
          <div
            key={counselor.id}
            className={`p-6 border-2 rounded-xl transition-all cursor-pointer ${
              selectedCounselor?.id === counselor.id
                ? 'border-primary-500 bg-primary-50'
                : 'border-secondary-200 hover:border-primary-300 hover:shadow-md'
            }`}
            onClick={() => {
              setSelectedCounselor(counselor);
              setStep(3);
            }}
          >
            <div className="flex items-start space-x-4">
              <img
                src={counselor.image}
                alt={counselor.name}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-xl font-semibold text-secondary-900">{counselor.name}</h3>
                    <p className="text-secondary-600">{counselor.title}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-1 text-yellow-500">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="text-sm font-medium text-secondary-700">{counselor.rating}</span>
                    </div>
                    <p className="text-xs text-secondary-500">{counselor.experience}</p>
                  </div>
                </div>
                
                <p className="text-sm text-secondary-600 mb-3">{counselor.bio}</p>
                
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {counselor.specialties.map((specialty, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center text-sm text-secondary-600 space-x-4">
                    <span className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {counselor.location}
                    </span>
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {counselor.availability}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-sm text-secondary-600">
                    <span>Languages: {counselor.languages.join(', ')}</span>
                    {counselor.insuranceAccepted && (
                      <span className="ml-4 flex items-center text-green-600">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Insurance accepted
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Date and time selection step
  const renderDateTimeSelection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-secondary-900">Schedule Appointment</h2>
          <p className="text-secondary-600">with {selectedCounselor?.name}</p>
        </div>
        <button
          onClick={() => setStep(2)}
          className="text-primary-600 hover:text-primary-700 text-sm font-medium"
        >
          ← Back to Counselors
        </button>
      </div>
      
      {/* Appointment Type */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-secondary-900">Appointment Type</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { id: 'in-person', name: 'In-Person', icon: Users, description: 'Meet at the counseling center' },
            { id: 'virtual', name: 'Virtual', icon: MessageSquare, description: 'Video call appointment' }
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => setAppointmentType(type.id)}
              className={`p-4 text-left border-2 rounded-lg transition-all ${
                appointmentType === type.id
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-secondary-200 hover:border-primary-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                <type.icon className="h-5 w-5 text-primary-600" />
                <div>
                  <div className="font-medium text-secondary-900">{type.name}</div>
                  <div className="text-sm text-secondary-600">{type.description}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
      
      {/* Date Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-secondary-900">Select Date</h3>
        <input
          type="date"
          value={selectedDate.toISOString().split('T')[0]}
          onChange={(e) => setSelectedDate(new Date(e.target.value))}
          min={new Date().toISOString().split('T')[0]}
          max={addDays(new Date(), 30).toISOString().split('T')[0]}
          className="border border-secondary-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500"
        />
      </div>
      
      {/* Time Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-secondary-900">Available Times</h3>
        <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
          {availableSlots.map((slot, index) => (
            <button
              key={index}
              onClick={() => slot.available && setSelectedTime(slot.time)}
              disabled={!slot.available}
              className={`p-3 text-sm rounded-lg transition-all ${
                !slot.available
                  ? 'bg-secondary-100 text-secondary-400 cursor-not-allowed'
                  : selectedTime && selectedTime.getTime() === slot.time.getTime()
                  ? 'bg-primary-500 text-white'
                  : 'bg-white border border-secondary-300 hover:border-primary-500'
              }`}
            >
              {format(slot.time, 'h:mm a')}
            </button>
          ))}
        </div>
      </div>
      
      {/* Urgency Level */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-secondary-900">Urgency Level</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { id: 'routine', name: 'Routine', color: 'green', description: 'General support and guidance' },
            { id: 'moderate', name: 'Moderate', color: 'yellow', description: 'Some urgency, but not critical' },
            { id: 'urgent', name: 'Urgent', color: 'red', description: 'Immediate support needed' }
          ].map((level) => (
            <button
              key={level.id}
              onClick={() => setUrgency(level.id)}
              className={`p-4 text-left border-2 rounded-lg transition-all ${
                urgency === level.id
                  ? `border-${level.color}-500 bg-${level.color}-50`
                  : 'border-secondary-200 hover:border-secondary-300'
              }`}
            >
              <div className="font-medium text-secondary-900">{level.name}</div>
              <div className="text-sm text-secondary-600">{level.description}</div>
            </button>
          ))}
        </div>
      </div>
      
      {/* Reason for Appointment */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-secondary-900">Reason for Appointment (Optional)</h3>
        <textarea
          value={appointmentReason}
          onChange={(e) => setAppointmentReason(e.target.value)}
          placeholder="Briefly describe what you'd like to discuss (this helps your counselor prepare)"
          className="w-full p-4 border border-secondary-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500"
          rows={3}
          maxLength={500}
        />
        <div className="text-sm text-secondary-500 text-right">
          {appointmentReason.length}/500 characters
        </div>
      </div>
      
      {/* Book Appointment Button */}
      {selectedTime && (
        <div className="bg-primary-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">Appointment Summary</h3>
          <div className="space-y-2 text-sm text-secondary-700 mb-6">
            <p><strong>Counselor:</strong> {selectedCounselor.name}</p>
            <p><strong>Date:</strong> {format(selectedDate, 'EEEE, MMMM dd, yyyy')}</p>
            <p><strong>Time:</strong> {format(selectedTime, 'h:mm a')}</p>
            <p><strong>Type:</strong> {appointmentType === 'in-person' ? 'In-Person' : 'Virtual'}</p>
            <p><strong>Location:</strong> {appointmentType === 'in-person' ? selectedCounselor.location : 'Virtual (link will be sent)'}</p>
          </div>
          
          <button
            onClick={handleBookAppointment}
            disabled={isBooking}
            className="w-full btn-primary inline-flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {isBooking ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <CheckCircle className="h-5 w-5" />
            )}
            <span>{isBooking ? 'Booking...' : 'Book Appointment'}</span>
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-8">
        <div className="w-10 h-10 bg-gradient-to-br from-success-500 to-success-600 rounded-full flex items-center justify-center shadow-lg">
          <Calendar className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Book Appointment</h1>
          <p className="text-secondary-600">Confidential and secure appointment booking</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8 px-4">
        {[
          { step: 1, title: 'Service' },
          { step: 2, title: 'Counselor' },
          { step: 3, title: 'Schedule' }
        ].map((item, index) => (
          <React.Fragment key={item.step}>
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= item.step
                  ? 'bg-primary-500 text-white'
                  : 'bg-secondary-200 text-secondary-600'
              }`}>
                {step > item.step ? <CheckCircle className="h-4 w-4" /> : item.step}
              </div>
              <span className={`ml-2 text-sm font-medium ${
                step >= item.step ? 'text-primary-600' : 'text-secondary-500'
              }`}>
                {item.title}
              </span>
            </div>
            {index < 2 && (
              <div className={`flex-1 h-px mx-4 ${
                step > item.step ? 'bg-primary-500' : 'bg-secondary-200'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-lg border border-secondary-200 p-8">
        {step === 1 && renderServiceSelection()}
        {step === 2 && renderCounselorSelection()}
        {step === 3 && renderDateTimeSelection()}
      </div>

      {/* Emergency Resources */}
      <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-6 w-6 text-red-600 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-red-900 mb-2">Need Immediate Help?</h3>
            <div className="space-y-2 text-sm text-red-700">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span><strong>Crisis Hotline:</strong> <a href="tel:988" className="underline">988</a></span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span><strong>Campus Emergency:</strong> <a href="tel:555-123-4567" className="underline">(555) 123-4567</a></span>
              </div>
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-4 w-4" />
                <span><strong>Crisis Text Line:</strong> Text HOME to 741741</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Privacy Notice */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-700">
            <strong>Your Privacy Matters:</strong> All appointments are confidential and comply with FERPA and HIPAA regulations. 
            Your information is secure and will only be shared with your explicit consent or as required by law.
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;
