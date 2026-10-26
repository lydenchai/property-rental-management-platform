import { reactive, toRefs, toRef, computed } from 'vue';
import type {
  PropertyItem,
  PropertyDetail,
  PropertyFilterParams,
  CreatePropertyInput,
  UpdatePropertyInput,
  CreateUnitInput,
  UpdateUnitInput,
} from '~~/shared/types';

export function usePropertyStore() {
  const state = reactive({
    properties: [] as PropertyItem[],
    selectedProperty: null as PropertyDetail | null,
    currentProperty: null as PropertyDetail | null,
    isLoading: false,
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
    isSubmitting: false,
    isSubmittingUnit: false,
    error: null as any,
  });

  // Computed metrics
  const totalProperties = computed(() => state.properties.length);
  const totalUnits = computed(() =>
    state.properties.reduce((acc, p) => acc + (p.unitsCount || 0), 0)
  );
  const totalAvailable = computed(() =>
    state.properties.reduce((acc, p) => acc + (p.availableUnitsCount || 0), 0)
  );
  const occupancyRate = computed(() => {
    if (totalUnits.value === 0) return 0;
    const occupied = totalUnits.value - totalAvailable.value;
    return Math.round((occupied / totalUnits.value) * 100);
  });

  async function fetchProperties(filter: PropertyFilterParams = {}) {
    state.isLoading = true;
    state.error = null;

    try {
      const queryParams: Record<string, any> = {};
      if (filter.landlordId) queryParams.landlordId = filter.landlordId;
      if (filter.city) queryParams.city = filter.city;
      if (filter.search) queryParams.search = filter.search;
      if (filter.minRent !== undefined) queryParams.minRent = filter.minRent;
      if (filter.maxRent !== undefined) queryParams.maxRent = filter.maxRent;

      const { data, error }: any = await useFetch('/api/v1/properties', {
        query: queryParams,
      });

      if (data.value) {
        state.properties = data.value.data?.properties || data.value.data || [];
        return state.properties;
      } else {
        throw error.value || new Error('Failed to fetch properties');
      }
    } catch (err: any) {
      state.error = err?.data?.error?.message || err?.message || 'Failed to fetch properties';
      throw err;
    } finally {
      state.isLoading = false;
    }
  }

  async function fetchPropertyById(id: string) {
    state.isLoading = true;
    state.error = null;

    try {
      const { data, error }: any = await useFetch(`/api/v1/properties/${id}`);

      if (data.value) {
        const prop = data.value.data?.property || data.value.data;
        state.selectedProperty = prop;
        state.currentProperty = prop;
        return { ...prop, success: true, property: prop, data: prop };
      } else {
        throw error.value || new Error('Failed to fetch property details');
      }
    } catch (err: any) {
      state.error = err?.data?.error?.message || err?.message || 'Failed to fetch property details';
      return { success: false, error: state.error };
    } finally {
      state.isLoading = false;
    }
  }

  async function createProperty(input: CreatePropertyInput) {
    state.isCreating = true;
    state.isSubmitting = true;
    state.error = null;

    try {
      const { data, error }: any = await useFetch('/api/v1/properties', {
        method: 'POST',
        body: input,
      });

      if (data.value) {
        const prop = data.value.data?.property || data.value.data;
        if (prop) {
          state.properties.unshift(prop);
        }
        return { success: true, property: prop, data: data.value.data };
      } else {
        throw error.value || new Error('Failed to create property');
      }
    } catch (err: any) {
      state.error = err?.data?.error?.message || err?.message || 'Failed to create property';
      return { success: false, error: state.error };
    } finally {
      state.isCreating = false;
      state.isSubmitting = false;
    }
  }

  async function updateProperty(id: string, input: UpdatePropertyInput) {
    state.isUpdating = true;
    state.isSubmitting = true;
    state.error = null;

    try {
      const { data, error }: any = await useFetch(`/api/v1/properties/${id}`, {
        method: 'PUT',
        body: input,
      });

      if (data.value) {
        const updated = data.value.data?.property || data.value.data;
        const idx = state.properties.findIndex((p) => p.id === id);
        if (idx !== -1 && updated) {
          state.properties[idx] = { ...state.properties[idx], ...updated };
        }
        if (state.selectedProperty && state.selectedProperty.id === id && updated) {
          state.selectedProperty = { ...state.selectedProperty, ...updated };
          state.currentProperty = state.selectedProperty;
        }
        return { success: true, property: updated, data: data.value.data };
      } else {
        throw error.value || new Error('Failed to update property');
      }
    } catch (err: any) {
      state.error = err?.data?.error?.message || err?.message || 'Failed to update property';
      return { success: false, error: state.error };
    } finally {
      state.isUpdating = false;
      state.isSubmitting = false;
    }
  }

  async function deleteProperty(id: string) {
    state.isDeleting = true;
    state.error = null;

    try {
      const { data, error }: any = await useFetch(`/api/v1/properties/${id}`, {
        method: 'DELETE',
      });

      if (data.value) {
        state.properties = state.properties.filter((p) => p.id !== id);
        if (state.selectedProperty?.id === id) {
          state.selectedProperty = null;
          state.currentProperty = null;
        }
        return { success: true, data: data.value.data };
      } else {
        throw error.value || new Error('Failed to delete property');
      }
    } catch (err: any) {
      state.error = err?.data?.error?.message || err?.message || 'Failed to delete property';
      return { success: false, error: state.error };
    } finally {
      state.isDeleting = false;
    }
  }

  async function addUnit(propertyId: string, input: CreateUnitInput) {
    state.isCreating = true;
    state.isSubmittingUnit = true;
    state.error = null;

    try {
      const { data, error }: any = await useFetch(`/api/v1/properties/${propertyId}/units`, {
        method: 'POST',
        body: input,
      });

      if (data.value) {
        const unit = data.value.data?.unit || data.value.data;
        if (state.selectedProperty && state.selectedProperty.id === propertyId && unit) {
          state.selectedProperty.units = [...(state.selectedProperty.units || []), unit];
          state.selectedProperty.unitsCount = (state.selectedProperty.unitsCount || 0) + 1;
          if (unit.status === 'AVAILABLE') {
            state.selectedProperty.availableUnitsCount =
              (state.selectedProperty.availableUnitsCount || 0) + 1;
          }
          state.currentProperty = state.selectedProperty;
        }
        return { success: true, unit, data: data.value.data };
      } else {
        throw error.value || new Error('Failed to add unit');
      }
    } catch (err: any) {
      state.error = err?.data?.error?.message || err?.message || 'Failed to add unit';
      return { success: false, error: state.error };
    } finally {
      state.isCreating = false;
      state.isSubmittingUnit = false;
    }
  }

  async function updateUnit(...args: any[]) {
    state.isUpdating = true;
    state.isSubmittingUnit = true;
    state.error = null;

    let unitId: string;
    let input: UpdateUnitInput;

    if (args.length >= 3) {
      // updateUnit(propertyId, unitId, input)
      unitId = args[1];
      input = args[2];
    } else {
      // updateUnit(unitId, input)
      unitId = args[0];
      input = args[1];
    }

    try {
      const { data, error }: any = await useFetch(`/api/v1/units/${unitId}`, {
        method: 'PUT',
        body: input,
      });

      if (data.value) {
        const updated = data.value.data?.unit || data.value.data;
        if (state.selectedProperty?.units && updated) {
          const idx = state.selectedProperty.units.findIndex((u) => u.id === unitId);
          if (idx !== -1) {
            state.selectedProperty.units[idx] = {
              ...state.selectedProperty.units[idx],
              ...updated,
            };
          }
          state.currentProperty = state.selectedProperty;
        }
        return { success: true, unit: updated, data: data.value.data };
      } else {
        throw error.value || new Error('Failed to update unit');
      }
    } catch (err: any) {
      state.error = err?.data?.error?.message || err?.message || 'Failed to update unit';
      return { success: false, error: state.error };
    } finally {
      state.isUpdating = false;
      state.isSubmittingUnit = false;
    }
  }

  async function deleteUnit(...args: any[]) {
    state.isDeleting = true;
    state.error = null;

    const unitId = args.length >= 2 ? args[1] : args[0];

    try {
      const { data, error }: any = await useFetch(`/api/v1/units/${unitId}`, {
        method: 'DELETE',
      });

      if (data.value) {
        if (state.selectedProperty?.units) {
          const unit = state.selectedProperty.units.find((u) => u.id === unitId);
          state.selectedProperty.units = state.selectedProperty.units.filter(
            (u) => u.id !== unitId
          );
          state.selectedProperty.unitsCount = Math.max(
            0,
            (state.selectedProperty.unitsCount || 1) - 1
          );
          if (unit?.status === 'AVAILABLE') {
            state.selectedProperty.availableUnitsCount = Math.max(
              0,
              (state.selectedProperty.availableUnitsCount || 1) - 1
            );
          }
          state.currentProperty = state.selectedProperty;
        }
        return { success: true, data: data.value.data };
      } else {
        throw error.value || new Error('Failed to delete unit');
      }
    } catch (err: any) {
      state.error = err?.data?.error?.message || err?.message || 'Failed to delete unit';
      return { success: false, error: state.error };
    } finally {
      state.isDeleting = false;
    }
  }

  function clearError() {
    state.error = null;
  }

  return {
    state,
    ...toRefs(state),
    selectedProperty: toRef(state, 'selectedProperty'),
    currentProperty: toRef(state, 'selectedProperty'),
    isSubmitting: toRef(state, 'isUpdating'),
    isSubmittingUnit: toRef(state, 'isCreating'),
    errorMessage: toRef(state, 'error'),
    totalProperties,
    totalUnits,
    totalAvailable,
    occupancyRate,
    fetchProperties,
    fetchPropertyById,
    createProperty,
    updateProperty,
    deleteProperty,
    addUnit,
    createUnit: addUnit,
    updateUnit,
    deleteUnit,
    clearError,
  };
}
