import Swal from 'sweetalert2';

export const showError = (message, icon = 'error') => {
  return Swal.fire({
    icon: icon,
    title: 'Error',
    text: message,
    confirmButtonText: 'Aceptar',
    confirmButtonColor: '#3085d6',
  });
}

export const showSuccess = (message) => {
  return Swal.fire({
    icon: 'success',
    title: 'Éxito',
    text: message,
    confirmButtonText: 'Aceptar',
    confirmButtonColor: '#098b2aff',
  });
}

//crear el swal de loading
export const showLoading = (mostrar = true, message = "Cargando") => {
  if (mostrar) {
    return Swal.fire({
      icon: 'info',
      title: message,
      text: 'Esto puede tomar unos momentos',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
  } else {
    Swal.close();
  }
}

//swal de question
export const showQuestion = (message, title = "¿Estas seguro?") => {
  return Swal.fire({
    icon: 'question',
    title: title,
    text: message,
    showCancelButton: true,
    confirmButtonText: 'Aceptar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
  });
}

