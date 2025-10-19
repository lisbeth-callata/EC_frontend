import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Box,
  Typography,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Autocomplete,
  Chip,
  Paper,
  IconButton,
  CircularProgress,
  Fade,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Add,
  Person,
  LocationOn,
  Close,
  Search,
  MyLocation,
  CheckCircle,
  Scale,
  Assignment,
  Schedule,
  AccessTime,
  Warning
} from '@mui/icons-material';
import { adminService } from '../../../services/admin';

const LIMA_DISTRICTS = [
  'Lima', 'Ancón', 'Ate', 'Barranco', 'Breña', 'Carabayllo', 'Chaclacayo', 'Chorrillos',
  'Cieneguilla', 'Comas', 'El Agustino', 'Independencia', 'Jesús María', 'La Molina',
  'La Victoria', 'Lince', 'Los Olivos', 'Lurigancho', 'Lurín', 'Magdalena del Mar',
  'Miraflores', 'Pachacámac', 'Pucusana', 'Pueblo Libre', 'Puente Piedra', 'Punta Hermosa',
  'Punta Negra', 'Rímac', 'San Bartolo', 'San Borja', 'San Isidro', 'San Juan de Lurigancho',
  'San Juan de Miraflores', 'San Luis', 'San Martín de Porres', 'San Miguel', 'Santa Anita',
  'Santa María del Mar', 'Santa Rosa', 'Santiago de Surco', 'Surquillo', 'Villa El Salvador',
  'Villa María del Triunfo'
];

const GoogleMapPicker = React.memo(({ onLocationSelect, initialLocation, isOpen }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerRef = useRef(null);
  const searchBoxRef = useRef(null);
  const searchInputRef = useRef(null);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);

  const isUrbanization = useCallback((name) => {
    if (!name) return false;
    const urbanizations = [
      'urb', 'urbanización', 'residencial', 'aa.hh.', 'asentamiento humano',
      'santa carmela', 'lima industrial', 'condominio', 'conjunto habitacional'
    ];

    const lowerName = name.toLowerCase();
    return urbanizations.some(urb => lowerName.includes(urb));
  }, []);

  const cleanDistrictName = useCallback((name) => {
    if (!name) return '';
    return name
      .replace(/Provincia de\s*/i, '')
      .replace(/Departamento de\s*/i, '')
      .replace(/Distrito de\s*/i, '')
      .replace(/Distrito\s*/i, '')
      .replace(/District/i, '')
      .replace(/Urb\./i, '')
      .replace(/Urb\s*/i, '')
      .replace(/Urbanización\s*/i, '')
      .replace(/Residencial\s*/i, '')
      .replace(/,\s*Lima/i, '') // Remover ", Lima" del final
      .trim();
  }, []);

  const cleanProvinceName = useCallback((name) => {
    if (!name) return '';
    return name
      .replace(/Provincia de\s*/i, '')
      .replace(/Provincia\s*/i, '')
      .replace(/Province/i, '')
      .trim();
  }, []);

  const cleanRegionName = useCallback((name) => {
    if (!name) return '';
    return name
      .replace(/Provincia de\s*/i, '')
      .replace(/Departamento de\s*/i, '')
      .replace(/Región\s*/i, '')
      .replace(/Region/i, '')
      .replace(/Department/i, '')
      .trim();
  }, []);

  const extractDistrictFromAddress = useCallback((fullAddress, components) => {
    const districtPatterns = [
      /,\s*([^,]+?)\s*(?:Lima\s*)?\d{5},/i, // Ej: ", Santiago de Surco Lima 15023,"
      /,\s*([^,]+?)\s*\d{5},/i, // Ej: ", Santiago de Surco 15023,"
      /Distrito\s+de\s+([^,]+)/i, // "Distrito de Surco"
      /([^,]+?)\s+\d{5}/i, // "Santiago de Surco 15023"
      /en\s+([^,]+?),/i, // "en Surco,"
      /,\s*([^,]+?)\s*$/i // ", Surco"
    ];

    for (let pattern of districtPatterns) {
      const match = fullAddress.match(pattern);
      if (match && match[1]) {
        const possibleDistrict = cleanDistrictName(match[1].trim());
        if (possibleDistrict && !isUrbanization(possibleDistrict)) {
          const limaMatch = LIMA_DISTRICTS.find(d =>
            d.toLowerCase().includes(possibleDistrict.toLowerCase()) ||
            possibleDistrict.toLowerCase().includes(d.toLowerCase())
          );
          if (limaMatch) {
            return limaMatch;
          }
          return possibleDistrict;
        }
      }
    }

    return '';
  }, [cleanDistrictName, isUrbanization]);

  const findLimaDistrict = useCallback((components, fullAddress) => {
    const provinceComponent = components.find(comp =>
      comp.types.includes('administrative_area_level_2')
    );

    if (provinceComponent && provinceComponent.long_name.includes('Lima')) {
      console.log('🏙️ Detectada provincia de Lima, buscando distrito...');

      const districtComponent = components.find(comp =>
        comp.types.includes('administrative_area_level_3')
      );

      if (districtComponent) {
        const districtName = districtComponent.long_name;
        const validDistrict = LIMA_DISTRICTS.find(d =>
          districtName.toLowerCase().includes(d.toLowerCase()) ||
          d.toLowerCase().includes(districtName.toLowerCase())
        );
        if (validDistrict) {
          console.log('Distrito de Lima válido encontrado:', validDistrict);
          return validDistrict;
        }
      }

      const localityComponent = components.find(comp =>
        comp.types.includes('locality') ||
        comp.types.includes('sublocality_level_1')
      );

      if (localityComponent) {
        const localityName = localityComponent.long_name;
        const validDistrict = LIMA_DISTRICTS.find(d =>
          localityName.toLowerCase().includes(d.toLowerCase()) ||
          d.toLowerCase().includes(localityName.toLowerCase())
        );
        if (validDistrict && !isUrbanization(validDistrict)) {
          console.log('Distrito de Lima encontrado en locality:', validDistrict);
          return validDistrict;
        }
      }

      for (let district of LIMA_DISTRICTS) {
        if (fullAddress.toLowerCase().includes(district.toLowerCase())) {
          console.log('Distrito de Lima encontrado en dirección completa:', district);
          return district;
        }
      }
    }
    return null;
  }, [isUrbanization]);

  const findGeneralLocation = useCallback((components, addressComponents) => {
    let foundDistrict = false;

    components.forEach(component => {
      const types = component.types;

      if (types.includes('administrative_area_level_3') && !foundDistrict) {
        addressComponents.district = component.long_name;
        foundDistrict = true;
        console.log('📍 Distrito detectado por administrative_area_level_3:', component.long_name);
      }

      if (types.includes('locality') && !foundDistrict) {
        const possibleDistrict = component.long_name;
        if (!isUrbanization(possibleDistrict)) {
          addressComponents.district = possibleDistrict;
          foundDistrict = true;
          console.log('📍 Distrito detectado por locality:', component.long_name);
        }
      }

      if (types.includes('administrative_area_level_2') && !addressComponents.province) {
        addressComponents.province = component.long_name;
      }

      if (types.includes('administrative_area_level_1') && !addressComponents.region) {
        addressComponents.region = component.long_name;
      }

      if (types.includes('country') && !addressComponents.country) {
        addressComponents.country = component.long_name;
      }
    });

    if (!foundDistrict && addressComponents.address) {
      addressComponents.district = extractDistrictFromAddress(addressComponents.address, components);
      console.log('📍 Distrito extraído de la dirección:', addressComponents.district);
    }
  }, [isUrbanization, extractDistrictFromAddress]);

  const reverseGeocode = useCallback((location) => {
    if (!window.google) return;

    const geocoder = new window.google.maps.Geocoder();

    geocoder.geocode({ location }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const address = results[0].formatted_address;
        setAddress(address);
        const addressComponents = {
          address: address,
          latitude: location.lat,
          longitude: location.lng,
          district: '',
          province: '',
          region: '',
          country: ''
        };
        console.log('🔍 Todos los componentes de dirección:', results[0].address_components);
        const components = results[0].address_components;

        const limaDistrict = findLimaDistrict(components, address);
        if (limaDistrict) {
          addressComponents.district = limaDistrict;
          addressComponents.province = 'Lima';
          addressComponents.region = 'Lima';
          console.log('📍 Distrito de Lima detectado:', limaDistrict);
        } else {
          findGeneralLocation(components, addressComponents);
        }
        addressComponents.district = cleanDistrictName(addressComponents.district);
        addressComponents.province = cleanProvinceName(addressComponents.province);
        addressComponents.region = cleanRegionName(addressComponents.region);

        console.log('✅ Componentes finales de dirección:', addressComponents);

        if (onLocationSelect) {
          onLocationSelect(addressComponents);
        }
      }
    });
  }, [onLocationSelect, findLimaDistrict, findGeneralLocation, cleanDistrictName, cleanProvinceName, cleanRegionName]);

  const initializeSearchBox = useCallback(() => {
    if (!window.google || !searchInputRef.current) return;

    try {
      searchBoxRef.current = new window.google.maps.places.SearchBox(searchInputRef.current);

      searchBoxRef.current.addListener('places_changed', () => {
        const places = searchBoxRef.current.getPlaces();

        if (!places || places.length === 0) {
          return;
        }

        const place = places[0];
        if (!place.geometry || !place.geometry.location) {
          console.warn('No geometry found for place:', place);
          return;
        }

        const location = place.geometry.location;
        if (mapInstance.current && markerRef.current) {
          mapInstance.current.setCenter(location);
          mapInstance.current.setZoom(17);
          markerRef.current.setPosition(location);
          reverseGeocode({ lat: location.lat(), lng: location.lng() });
        }
      });

    } catch (error) {
      console.error('Error initializing search box:', error);
    }
  }, [reverseGeocode]);

  const initializeMap = useCallback(() => {
    if (!window.google || !mapRef.current) {
      setLoading(false);
      return;
    }

    try {
      const defaultCenter = initialLocation || { lat: -12.0464, lng: -77.0428 };

      mapInstance.current = new window.google.maps.Map(mapRef.current, {
        center: defaultCenter,
        zoom: 15,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true,
        zoomControlOptions: {
          position: window.google.maps.ControlPosition.RIGHT_CENTER
        },
        mapTypeControlOptions: {
          position: window.google.maps.ControlPosition.TOP_RIGHT
        },
        scrollwheel: true,
        gestureHandling: 'cooperative'
      });

      markerRef.current = new window.google.maps.Marker({
        map: mapInstance.current,
        position: defaultCenter,
        draggable: true,
        animation: window.google.maps.Animation.DROP,
        title: 'Ubicación seleccionada'
      });

      markerRef.current.addListener('dragend', () => {
        const position = markerRef.current.getPosition();
        reverseGeocode({ lat: position.lat(), lng: position.lng() });
      });

      mapInstance.current.addListener('click', (event) => {
        const position = event.latLng;
        markerRef.current.setPosition(position);
        reverseGeocode({ lat: position.lat(), lng: position.lng() });
      });

      setTimeout(() => {
        initializeSearchBox();
      }, 1000);

      if (initialLocation) {
        setTimeout(() => {
          reverseGeocode(initialLocation);
        }, 500);
      }

      setMapLoaded(true);
      setLoading(false);

    } catch (error) {
      console.error('Error initializing map:', error);
      setLoading(false);
    }
  }, [initialLocation, initializeSearchBox, reverseGeocode]);

  const loadGoogleMaps = useCallback(() => {
    if (window.google) {
      if (isOpen) initializeMap();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCNa-R4Zw8X7jM4oaT3BlM4bYw5DnsGFgI&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (isOpen) initializeMap();
    };
    script.onerror = () => {
      setLoading(false);
      console.error('Error loading Google Maps');
    };
    document.head.appendChild(script);
  }, [isOpen, initializeMap]);

  const getCurrentLocation = useCallback(() => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };

          if (mapInstance.current && markerRef.current) {
            mapInstance.current.setCenter(location);
            mapInstance.current.setZoom(16);
            markerRef.current.setPosition(location);
            reverseGeocode(location);
          }
          setLoading(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setLoading(false);
          alert('No se pudo obtener la ubicación actual.');
        }
      );
    } else {
      alert('La geolocalización no es soportada por este navegador.');
    }
  }, [reverseGeocode]);

  useEffect(() => {
    if (isOpen && !window.google) {
      loadGoogleMaps();
    } else if (isOpen && window.google && !mapLoaded) {
      initializeMap();
    }
  }, [isOpen, mapLoaded, loadGoogleMaps, initializeMap]);

  useEffect(() => {
    return () => {
      if (mapInstance.current) {
        mapInstance.current = null;
      }
      if (markerRef.current) {
        markerRef.current = null;
      }
      if (searchBoxRef.current) {
        searchBoxRef.current = null;
      }
    };
  }, []);

  return (
    <Box sx={{ height: '500px', position: 'relative', width: '100%' }}>
      <Box sx={{ position: 'absolute', top: 10, left: 10, right: 10, zIndex: 1000 }}>
        <TextField
          inputRef={searchInputRef}
          fullWidth
          placeholder="Buscar dirección, ciudad o lugar..."
          size="small"
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
          }}
          sx={{
            backgroundColor: 'white',
            borderRadius: 1,
            boxShadow: 3,
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: 'primary.main',
              },
              '&:hover fieldset': {
                borderColor: 'primary.dark',
              },
            },
          }}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
            }
          }}
        />
      </Box>

      <Button
        variant="contained"
        startIcon={<MyLocation />}
        onClick={getCurrentLocation}
        disabled={loading}
        sx={{
          position: 'absolute',
          bottom: 80,
          right: 10,
          zIndex: 1000,
          backgroundColor: 'white',
          color: 'primary.main',
          minWidth: 'auto',
          width: 48,
          height: 48,
          borderRadius: '50%',
          boxShadow: 2,
          '&:hover': {
            backgroundColor: 'grey.100',
            transform: 'scale(1.05)'
          },
          '& .MuiButton-startIcon': {
            margin: 0
          }
        }}
      />

      <Paper
        sx={{
          position: 'absolute',
          bottom: 10,
          left: 10,
          right: 10,
          zIndex: 1000,
          p: 1.5,
          backgroundColor: 'rgba(255,255,255,0.95)',
          border: '1px solid',
          borderColor: 'primary.light'
        }}
      >
        <Typography variant="caption" color="text.primary" fontWeight="medium">
          💡 <strong>Instrucciones:</strong> Haz click en el mapa para seleccionar la ubicación • Usa el scroll para hacer zoom • Busca direcciones en la barra superior
        </Typography>
      </Paper>

      <Box
        ref={mapRef}
        sx={{
          height: '100%',
          width: '100%',
          borderRadius: 1,
          border: '2px solid',
          borderColor: 'divider'
        }}
      />

      {loading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255,255,255,0.9)',
            borderRadius: 1,
            zIndex: 500
          }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress size={40} />
            <Typography variant="body2" sx={{ mt: 2 }}>
              Cargando mapa...
            </Typography>
          </Box>
        </Box>
      )}

      {address && !loading && (
        <Paper
          sx={{
            position: 'absolute',
            top: 60,
            left: 10,
            right: 10,
            zIndex: 1000,
            p: 2,
            backgroundColor: 'success.main',
            color: 'white',
            boxShadow: 3
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocationOn sx={{ fontSize: 20 }} />
            <Box>
              <Typography variant="body2" fontWeight="bold">
                Ubicación seleccionada:
              </Typography>
              <Typography variant="body2">
                {address}
              </Typography>
            </Box>
          </Box>
        </Paper>
      )}
    </Box>
  );
});

const RequestModal = ({ open, onClose, request, onSave }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    material: '',
    description: '',
    status: 'PENDING',
    assignmentStatus: 'AVAILABLE',
    weight: '',
    address: '',
    district: '',
    province: '',
    region: '',
    country: '',
    addressUser: '',
    reference: '',
    latitude: null,
    longitude: null,
    userId: null
  });
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [mapDialogOpen, setMapDialogOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const allowedMaterials = ['Plástico', 'Vidrio', 'Cartón'];

  const steps = request ?
    ['Información Básica', 'Ubicación', 'Estado y Asignación'] :
    ['Información Básica', 'Ubicación', 'Asignación'];

  const statusOptions = useMemo(() => [
    { value: 'PENDING', label: 'Pendiente', icon: <Schedule /> },
    { value: 'SCHEDULED', label: 'Programado', icon: <AccessTime /> },
    { value: 'COLLECTED', label: 'Recolectado', icon: <CheckCircle /> },
    { value: 'CANCELLED', label: 'Cancelado', icon: <Close /> }
  ], []);

  const assignmentOptions = useMemo(() => [
    { value: 'AVAILABLE', label: 'Disponible', icon: <Assignment /> },
    { value: 'PENDING', label: 'Pendiente', icon: <Schedule /> },
    { value: 'IN_PROGRESS', label: 'En Progreso', icon: <AccessTime /> },
    { value: 'COMPLETED', label: 'Completado', icon: <CheckCircle /> },
    { value: 'CANCELLED', label: 'Cancelado', icon: <Close /> }
  ], []);

  const getAvailableAssignmentOptions = useCallback((status) => {
    switch (status) {
      case 'PENDING':
        return assignmentOptions.filter(option =>
          ['AVAILABLE', 'PENDING', 'IN_PROGRESS'].includes(option.value)
        );

      case 'SCHEDULED':
        return assignmentOptions.filter(option =>
          ['AVAILABLE', 'PENDING'].includes(option.value)
        );

      case 'COLLECTED':
        return assignmentOptions.filter(option =>
          option.value === 'COMPLETED'
        );

      case 'CANCELLED':
        return assignmentOptions.filter(option =>
          option.value === 'CANCELLED'
        );

      default:
        return assignmentOptions;
    }
  }, [assignmentOptions]);

  const validateStatusAssignment = useCallback((status, assignmentStatus) => {
    const availableAssignments = getAvailableAssignmentOptions(status);
    const isValid = availableAssignments.some(option => option.value === assignmentStatus);

    if (!isValid) {
      const defaultAssignment = availableAssignments[0]?.value || 'AVAILABLE';
      return {
        isValid: false,
        message: `Para estado "${statusOptions.find(s => s.value === status)?.label}", la asignación debe ser: ${availableAssignments.map(a => a.label).join(', ')}`,
        defaultAssignment
      };
    }

    return { isValid: true, message: '', defaultAssignment: assignmentStatus };
  }, [getAvailableAssignmentOptions, statusOptions]);

  const getAssignmentHelperText = useCallback((status) => {
    const availableOptions = getAvailableAssignmentOptions(status);
    const optionLabels = availableOptions.map(option => option.label).join(', ');

    return `Opciones disponibles: ${optionLabels}`;
  }, [getAvailableAssignmentOptions]);

  const shouldShowWeightField = useCallback((status) => {
    return status === 'COLLECTED';
  }, []);

  useEffect(() => {
    if (open) {
      loadUsers();
      if (request) {
        const initialData = {
          material: request.material || '',
          description: request.description || '',
          status: request.status || 'PENDING',
          assignmentStatus: request.assignmentStatus || 'AVAILABLE',
          weight: request.weight || '',
          address: request.address || '',
          district: request.district || '',
          province: request.province || '',
          region: request.region || '',
          country: request.country || '',
          addressUser: request.addressUser || '',
          reference: request.reference || '',
          latitude: request.latitude || null,
          longitude: request.longitude || null,
          userId: request.userId || null
        };

        const validation = validateStatusAssignment(initialData.status, initialData.assignmentStatus);
        if (!validation.isValid) {
          initialData.assignmentStatus = validation.defaultAssignment;
        }

        setFormData(initialData);

        if (request.latitude && request.longitude) {
          setSelectedLocation({
            lat: request.latitude,
            lng: request.longitude
          });
        }
      } else {
        setFormData({
          material: '',
          description: '',
          status: 'PENDING',
          assignmentStatus: 'AVAILABLE',
          weight: '',
          address: '',
          district: '',
          province: '',
          region: '',
          country: '',
          addressUser: '',
          reference: '',
          latitude: null,
          longitude: null,
          userId: null
        });
        setSelectedLocation(null);
        setActiveStep(0);
      }
      setError('');
    }
  }, [request, open, validateStatusAssignment]);

  useEffect(() => {
    const normalUsers = users.filter(user => user.role === 'ROLE_USER');
    setFilteredUsers(normalUsers);
  }, [users]);

  const loadUsers = async () => {
    try {
      const response = await adminService.getAllUsers();
      setUsers(response.data || []);
    } catch (error) {
      console.error('Error loading users:', error);
      setUsers([]);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    const validation = validateStatusAssignment(formData.status, formData.assignmentStatus);
    if (!validation.isValid) {
      setError(`Error de validación: ${validation.message}`);
      setLoading(false);
      return;
    }

    const validationErrors = [];

    if (!formData.material) {
      validationErrors.push('Por favor selecciona un material');
    }

    if (!request && !formData.userId) {
      validationErrors.push('Por favor selecciona un usuario');
    }

    if (!formData.address || !formData.latitude || !formData.longitude) {
      validationErrors.push('Por favor selecciona una ubicación en el mapa');
    }

    if (validationErrors.length > 0) {
      setError(validationErrors.join('. '));
      setLoading(false);
      return;
    }

    try {
      const cleanFormData = {
        material: formData.material,
        description: formData.description || '',
        address: formData.address,
        district: formData.district || '',
        province: formData.province || '',
        region: formData.region || '',
        addressUser: formData.addressUser || '',
        reference: formData.reference || '',
        latitude: formData.latitude,
        longitude: formData.longitude
      };

      if (request) {
        cleanFormData.status = formData.status;
        cleanFormData.assignmentStatus = formData.assignmentStatus;
        cleanFormData.weight = formData.weight;

        await adminService.updateRequest(request.id, cleanFormData);
      } else {
        await adminService.createRequest(cleanFormData, formData.userId);
      }

      onSave();
      handleClose();
    } catch (error) {
      console.error('Error al guardar solicitud:', error);
      let errorMessage = 'Error al guardar la solicitud';

      if (error.response) {
        const serverError = error.response.data;
        errorMessage = serverError.message || serverError.error || serverError;
      } else if (error.request) {
        errorMessage = 'Error de conexión con el servidor';
      } else {
        errorMessage = error.message || 'Error inesperado';
      }

      setError(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };

      if (field === 'status') {
        const validation = validateStatusAssignment(value, prev.assignmentStatus);
        if (!validation.isValid) {
          newData.assignmentStatus = validation.defaultAssignment;
        }

        if (value !== 'COLLECTED') {
          newData.weight = '';
        }
      }

      return newData;
    });
  };

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleUserSelect = (event, value) => {
    handleChange('userId', value ? value.id : null);
  };

  const handleMapSelection = (addressData) => {
    setFormData(prev => ({
      ...prev,
      address: addressData.address,
      district: addressData.district || '',
      province: addressData.province || '',
      region: addressData.region || '',
      country: addressData.country || '',
      latitude: addressData.latitude,
      longitude: addressData.longitude
    }));
    setSelectedLocation({
      lat: addressData.latitude,
      lng: addressData.longitude
    });
  };

  const handleClose = () => {
    setMapDialogOpen(false);
    setActiveStep(0);
    onClose();
  };

  const renderStepContent = (step) => {
    if (step === 0) {
      return (
        <Box>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main', mb: 3 }}>
            Información del Material
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Material"
                value={formData.material}
                onChange={(e) => handleChange('material', e.target.value)}
                required
                SelectProps={{
                  native: true,
                }}
              >
                <option value=""></option>
                {allowedMaterials.map(material => (
                  <option key={material} value={material}>
                    {material}
                  </option>
                ))}
              </TextField>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Selecciona el tipo de material a recolectar
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descripción detallada del material"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                multiline
                rows={4}
                placeholder="Describe el material en detalle: tipo, cantidad, condiciones, etc."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    alignItems: 'flex-start'
                  }
                }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Proporciona información detallada para una mejor gestión
              </Typography>
            </Grid>
          </Grid>
        </Box>
      );
    }

    if (step === 1) {
      return (
        <Box>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main', mb: 3 }}>
            Ubicación de Recolección
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Define la ubicación exacta donde se realizará la recolección de materiales
          </Typography>

          <Button
            startIcon={<LocationOn />}
            onClick={() => setMapDialogOpen(true)}
            variant={formData.address ? "outlined" : "contained"}
            size="large"
            sx={{ minWidth: 200, mb: 3 }}
          >
            {formData.address ? 'Cambiar Ubicación' : 'Seleccionar en Mapa'}
          </Button>

          {formData.address && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Fade in={true}>
                  <Paper sx={{ p: 2.5, backgroundColor: 'success.main', color: 'white' }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                      <CheckCircle sx={{ fontSize: 24, mt: 0.5 }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body1" fontWeight="bold" gutterBottom>
                          Ubicación confirmada
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          {formData.address}
                        </Typography>
                        {formData.latitude && (
                          <Typography variant="caption" sx={{ opacity: 0.9 }}>
                            Coordenadas: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Paper>
                </Fade>
              </Grid>

              {/* MOSTRAR DISTRITO Y REGIÓN */}
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Distrito"
                  value={formData.district}
                  disabled
                  helperText="Distrito detectado automáticamente"
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Provincia"
                  value={formData.province}
                  disabled
                  helperText="Provincia detectada automáticamente"
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Región"
                  value={formData.region}
                  disabled
                  helperText="Región detectada automáticamente"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Dirección específica"
                  value={formData.addressUser}
                  onChange={(e) => handleChange('addressUser', e.target.value)}
                  placeholder="Ej: Casa, Departamento 201, Oficina, etc."
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Detalles específicos de la ubicación
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Referencia adicional"
                  value={formData.reference}
                  onChange={(e) => handleChange('reference', e.target.value)}
                  placeholder="Ej: Frente al parque, al lado del banco, portón azul..."
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Puntos de referencia adicionales
                </Typography>
              </Grid>
            </Grid>
          )}

          {!formData.address && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                Para continuar, haz click en <strong>"Seleccionar en Mapa"</strong> para elegir la ubicación donde se realizará la recolección
              </Typography>
            </Alert>
          )}
        </Box>
      );
    }

    if (step === 2) {
      if (request) {
        const availableAssignmentOptions = getAvailableAssignmentOptions(formData.status);
        const helperText = getAssignmentHelperText(formData.status);
        const validation = validateStatusAssignment(formData.status, formData.assignmentStatus);
        const showWeightField = shouldShowWeightField(formData.status);

        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main', mb: 3 }}>
              Estado y Asignación
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Actualiza el estado, asignación y peso de la solicitud.
            </Typography>

            <Grid container spacing={3}>
              {/* Estado de la Solicitud */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Estado de la Solicitud</InputLabel>
                  <Select
                    value={formData.status}
                    label="Estado de la Solicitud"
                    onChange={(e) => handleChange('status', e.target.value)}
                  >
                    {statusOptions.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {option.icon}
                          {option.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Define el estado general de la solicitud
                </Typography>
              </Grid>

              {/* Estado de Asignación */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Estado de Asignación</InputLabel>
                  <Select
                    value={formData.assignmentStatus}
                    label="Estado de Asignación"
                    onChange={(e) => handleChange('assignmentStatus', e.target.value)}
                    error={!validation.isValid}
                  >
                    {availableAssignmentOptions.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {option.icon}
                          {option.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Typography
                  variant="caption"
                  color={validation.isValid ? "text.secondary" : "error"}
                  sx={{ mt: 1, display: 'block' }}
                >
                  {validation.isValid ? helperText : validation.message}
                </Typography>
              </Grid>

              {/* Peso */}
              {showWeightField && (
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Peso (kg)"
                    type="number"
                    value={formData.weight}
                    onChange={(e) => handleChange('weight', e.target.value)}
                    inputProps={{ step: "0.1", min: "0" }}
                    placeholder="Ej: 2.5"
                    InputProps={{
                      startAdornment: <Scale sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Peso total del material recolectado
                  </Typography>
                </Grid>
              )}

              {/* Código  */}
              <Grid item xs={12} md={showWeightField ? 6 : 12}>
                <TextField
                  fullWidth
                  label="Código"
                  value={request.code}
                  disabled
                  InputProps={{
                    startAdornment: <Assignment sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              </Grid>

              {/* Resumen y Reglas de Validación */}
              <Grid item xs={12}>
                <Paper sx={{ p: 2, backgroundColor: 'grey.50', border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Resumen y Reglas de Validación
                  </Typography>

                  {/* Estado Actual */}
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                    <Chip
                      label={`Estado: ${formData.status}`}
                      color={
                        formData.status === 'COLLECTED' ? 'success' :
                          formData.status === 'PENDING' ? 'warning' :
                            formData.status === 'SCHEDULED' ? 'info' : 'default'
                      }
                      variant="outlined"
                    />
                    <Chip
                      label={`Asignación: ${formData.assignmentStatus}`}
                      color={
                        formData.assignmentStatus === 'COMPLETED' ? 'success' :
                          formData.assignmentStatus === 'IN_PROGRESS' ? 'info' :
                            formData.assignmentStatus === 'PENDING' ? 'warning' : 'default'
                      }
                      variant="outlined"
                    />
                    {formData.weight && (
                      <Chip
                        icon={<Scale />}
                        label={`Peso: ${formData.weight} kg`}
                        color="primary"
                        variant="outlined"
                      />
                    )}
                    {!showWeightField && (
                      <Chip
                        icon={<Scale />}
                        label="Peso: No disponible"
                        color="secondary"
                        variant="outlined"
                      />
                    )}
                  </Box>

                  {/* Reglas de Validación */}
                  {!validation.isValid && (
                    <Alert
                      severity="warning"
                      icon={<Warning />}
                      sx={{ mb: 2 }}
                    >
                      <Typography variant="body2" fontWeight="bold">
                        Combinación ajustada automáticamente
                      </Typography>
                      <Typography variant="body2">
                        {validation.message}
                      </Typography>
                    </Alert>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </Box>
        );
      } else {
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main', mb: 3 }}>
              Asignar a Usuario
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Selecciona el usuario al que se asignará esta solicitud de recolección
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Autocomplete
                  options={filteredUsers}
                  getOptionLabel={(user) => `${user.name} ${user.lastname} - ${user.email}`}
                  value={filteredUsers.find(user => user.id === formData.userId) || null}
                  onChange={handleUserSelect}
                  inputValue={userSearchTerm}
                  onInputChange={(event, newValue) => setUserSearchTerm(newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Buscar usuario"
                      placeholder="Escribe nombre, apellido o email del usuario..."
                      required
                      fullWidth
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          py: 0.5
                        }
                      }}
                    />
                  )}
                  renderOption={(props, user) => (
                    <li {...props}>
                      <Box sx={{ width: '100%', py: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                          <Typography variant="body1" fontWeight="bold" sx={{ flex: 1 }}>
                            {user.name} {user.lastname}
                          </Typography>
                          <Chip
                            label="Usuario"
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{ ml: 1 }}
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          📧 {user.email}
                        </Typography>
                        {user.phone && (
                          <Typography variant="caption" color="text.secondary">
                            📞 {user.phone}
                          </Typography>
                        )}
                      </Box>
                    </li>
                  )}
                  sx={{
                    '& .MuiAutocomplete-listbox': {
                      maxHeight: 250
                    }
                  }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Solo se muestran usuarios regulares (no recolectores ni administradores)
                </Typography>
              </Grid>

              {formData.userId && (
                <Grid item xs={12}>
                  <Fade in={true}>
                    <Paper sx={{ p: 2.5, backgroundColor: 'info.light', border: '1px solid', borderColor: 'info.main' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Person sx={{ fontSize: 32, color: 'info.main' }} />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body1" fontWeight="bold" color="info.dark">
                            Usuario seleccionado
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 0.5 }}>
                            <strong>Nombre:</strong> {filteredUsers.find(u => u.id === formData.userId)?.name} {filteredUsers.find(u => u.id === formData.userId)?.lastname}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Email:</strong> {filteredUsers.find(u => u.id === formData.userId)?.email}
                          </Typography>
                          {filteredUsers.find(u => u.id === formData.userId)?.phone && (
                            <Typography variant="body2">
                              <strong>Teléfono:</strong> {filteredUsers.find(u => u.id === formData.userId)?.phone}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </Paper>
                  </Fade>
                </Grid>
              )}

              <Grid item xs={12}>
                <Paper sx={{ p: 3, mt: 2, backgroundColor: 'grey.50', border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                    Resumen de la Solicitud
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2"><strong>Material:</strong> {formData.material}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2"><strong>Estado:</strong> Pendiente</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2"><strong>Descripción:</strong> {formData.description || 'No especificada'}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2"><strong>Ubicación:</strong> {formData.address}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2"><strong>Distrito:</strong> {formData.district}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2"><strong>Región:</strong> {formData.region}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2"><strong>Usuario:</strong> {formData.userId ? `${filteredUsers.find(u => u.id === formData.userId)?.name} ${filteredUsers.find(u => u.id === formData.userId)?.lastname}` : 'No asignado'}</Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        );
      }
    }
    return null;
  };
  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Add color="primary" sx={{ fontSize: 28 }} />
            <Box>
              <Typography variant="h5" fontWeight="600">
                {request ? 'Editar Solicitud' : 'Nueva Solicitud de Recolección'}
              </Typography>
              {request && (
                <Typography variant="body2" color="text.secondary">
                  Código: {request.code}
                </Typography>
              )}
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ py: 3 }}>
          <Stepper activeStep={activeStep} sx={{ mb: 5 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel
                  sx={{
                    '& .MuiStepLabel-label': {
                      fontSize: '0.9rem',
                      fontWeight: 500
                    }
                  }}
                >
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ minHeight: 400 }}>
            {renderStepContent(activeStep)}
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, justifyContent: 'space-between', borderTop: '1px solid', borderColor: 'divider' }}>
          <Button
            onClick={handleBack}
            disabled={activeStep === 0 || loading}
            sx={{ minWidth: 100 }}
          >
            Anterior
          </Button>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button onClick={handleClose} disabled={loading} sx={{ minWidth: 100 }}>
              Cancelar
            </Button>

            {activeStep === steps.length - 1 ? (
              <Button
                onClick={handleSubmit}
                variant="contained"
                disabled={loading}
                sx={{ minWidth: 140, py: 1 }}
              >
                {loading ? 'Guardando...' : (request ? 'Actualizar' : 'Crear Solicitud')}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                variant="contained"
                disabled={activeStep === 1 && !formData.address}
                sx={{ minWidth: 120, py: 1 }}
              >
                Siguiente
              </Button>
            )}
          </Box>
        </DialogActions>
      </Dialog>

      <Dialog
        open={mapDialogOpen}
        onClose={() => setMapDialogOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            minHeight: '600px',
            maxHeight: '90vh',
            width: '95%'
          }
        }}
      >
        <DialogTitle sx={{ pb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" fontWeight="600">
              Seleccionar Ubicación en el Mapa
            </Typography>
            <IconButton onClick={() => setMapDialogOpen(false)} size="large">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <GoogleMapPicker
            onLocationSelect={handleMapSelection}
            initialLocation={selectedLocation}
            isOpen={mapDialogOpen}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button
            onClick={() => setMapDialogOpen(false)}
            variant="contained"
            size="large"
            sx={{ minWidth: 180 }}
          >
            Confirmar Ubicación
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default RequestModal;