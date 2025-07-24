import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SokectSevice } from '../../services/socket.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-navegation',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './navegation.component.html',
  styleUrl: './navegation.component.css'
})
export class NavegationComponent implements OnInit {
  roomCode: string = ''; // Código de la sala que obtenemos de la URL
  roomName: string = ''; // Nombre de la sala que obtenemos del backend
  errorMessage: string = ''; // Para manejar errores
  usersInRoom: any[] = []; // Almacena los usuarios que se unen

  constructor(
    private route: ActivatedRoute,
    private SokectSevice: SokectSevice,
    private router: Router,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.roomCode = this.route.snapshot.paramMap.get('code') || '';
  }
  // Método para salir de la sala
  leaveRoom() {
    this.SokectSevice.leaveRoom(this.roomCode);

    // Escuchar el evento cuando el usuario ha salido correctamente
    this.SokectSevice.onLeftRoom().subscribe({
      next: () => {
        console.log(`Saliste de la sala ${this.roomCode}`);
        this.router.navigate(['/client']); // Redirigir
      },
      error: (err) => {
        console.error('Error al salir de la sala:', err);
        this.errorMessage = 'No se pudo salir de la sala.';
      },
    });
  }

  downloadAngularProject() {
    const url = `http://localhost:3000/api/export/angular/${this.roomCode}`;
    window.open(url, '_blank'); // Abre la descarga del zip en otra pestaña
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      console.log('Imagen seleccionada:', file.name);
      this.sendImageToBackend(file);
    }
  }
  
  // Método para enviar al backend (vacío por ahora como pediste)
  sendImageToBackend(file: File) {
    console.log('Enviando imagen al backend...', file);
    
    const formData = new FormData();
    formData.append('image', file);
    
    // Aquí iría tu llamada HTTP cuando esté listo el backend
    // this.http.post('http://localhost:5000/analyze-image', formData).subscribe(...)
  }
}
