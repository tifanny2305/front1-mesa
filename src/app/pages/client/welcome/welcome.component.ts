import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../services/api.service';
import { SokectSevice } from '../../../services/socket.service';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [FormsModule, CommonModule],
  providers: [ApiService],
  templateUrl: './welcome.component.html',
})
export class WelcomeComponent implements OnInit, OnDestroy {
  // Estados básicos
  roomName: string = '';
  roomCode: string = '';
  errorMessage: string = '';
  joinErrorMessage: string = '';
  
  // Estados de loading avanzados
  isCreatingRoom: boolean = false;
  isJoiningRoom: boolean = false;
  creationProgress: number = 0;
  currentLoadingStep: string = '';
  
  // Estados de UI interactiva
  mousePosition = { x: 0, y: 0 };
  particles: any[] = [];
  isHoveringCreate: boolean = false;
  isHoveringJoin: boolean = false;
  typewriterText: string = '';
  currentWord: number = 0;
  
  // Configuraciones de animaciones
  words = ['Colabora', 'Diseña', 'Crea', 'Innova', 'Construye'];
  private typewriterInterval: any;
  private loadingTimeout: any;
  private progressInterval: any;
  
  constructor(
    private apiService: ApiService,
    private router: Router,
    private SokectSevice: SokectSevice
  ) {}

  ngOnInit(): void {
    this.initParticles();
    this.startTypewriter();
    this.handleMouseMove();
  }

  ngOnDestroy(): void {
    if (this.typewriterInterval) clearInterval(this.typewriterInterval);
    if (this.loadingTimeout) clearTimeout(this.loadingTimeout);
    if (this.progressInterval) clearInterval(this.progressInterval);
  }

  // === ANIMACIONES INTERACTIVAS ===
  
  initParticles() {
    for (let i = 0; i < 50; i++) {
      this.particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.5 + 0.2
      });
    }
    this.animateParticles();
  }

  animateParticles() {
    this.particles.forEach(particle => {
      particle.x += particle.speedX;
      particle.y += particle.speedY;
      
      if (particle.x < 0 || particle.x > window.innerWidth) particle.speedX *= -1;
      if (particle.y < 0 || particle.y > window.innerHeight) particle.speedY *= -1;
    });
    
    requestAnimationFrame(() => this.animateParticles());
  }

  handleMouseMove() {
    document.addEventListener('mousemove', (e) => {
      this.mousePosition.x = e.clientX;
      this.mousePosition.y = e.clientY;
    });
  }

  startTypewriter() {
    let charIndex = 0;
    let isDeleting = false;
    
    this.typewriterInterval = setInterval(() => {
      const currentWordText = this.words[this.currentWord];
      
      if (!isDeleting) {
        this.typewriterText = currentWordText.substring(0, charIndex + 1);
        charIndex++;
        
        if (charIndex === currentWordText.length) {
          setTimeout(() => isDeleting = true, 1500);
        }
      } else {
        this.typewriterText = currentWordText.substring(0, charIndex - 1);
        charIndex--;
        
        if (charIndex === 0) {
          isDeleting = false;
          this.currentWord = (this.currentWord + 1) % this.words.length;
        }
      }
    }, isDeleting ? 50 : 100);
  }

  // === FUNCIONES DE NEGOCIO ===

  createRoom() {
    if (!this.roomName.trim()) {
      this.errorMessage = 'Por favor, ingresa un nombre para la sala';
      return;
    }

    this.isCreatingRoom = true;
    this.errorMessage = '';
    this.creationProgress = 0;
    this.simulateCreationProgress();
    
    const createRoomDto = { name: this.roomName };

    this.apiService.createRoom(createRoomDto).subscribe({
      next: (room) => {
        this.creationProgress = 100;
        this.currentLoadingStep = '¡Sala creada exitosamente!';
        
        setTimeout(() => {
          this.isCreatingRoom = false;
          this.router.navigate([`/room/${room.code}`]);
        }, 1000);
      },
      error: (err) => {
        console.error('Error al crear la sala:', err);
        this.isCreatingRoom = false;
        this.errorMessage = 'No se pudo crear la sala. Inténtalo de nuevo.';
        this.creationProgress = 0;
      },
    });
  }

  joinRoom() {
    if (!this.roomCode.trim()) {
      this.joinErrorMessage = 'Por favor, ingresa un código de sala';
      return;
    }

    this.isJoiningRoom = true;
    this.joinErrorMessage = '';

    this.apiService.joinRoom(this.roomCode).subscribe({
      next: (response) => {
        console.log('Respuesta del servidor:', response);
        
        setTimeout(() => {
          this.isJoiningRoom = false;
          this.router.navigate([`/room/${this.roomCode}`]);
        }, 1500);
      },
      error: (err) => {
        console.error('Error al unirse a la sala:', err);
        this.isJoiningRoom = false;
        this.joinErrorMessage = 'No se pudo unir a la sala. Verifica el código e inténtalo de nuevo.';
      }
    });
  }

  simulateCreationProgress() {
    const steps = [
      'Inicializando proyecto...',
      'Configurando espacio colaborativo...',
      'Preparando herramientas de diseño...',
      'Estableciendo conexión en tiempo real...',
      'Finalizando configuración...'
    ];
    
    let stepIndex = 0;
    
    this.progressInterval = setInterval(() => {
      if (this.creationProgress < 90 && stepIndex < steps.length) {
        this.creationProgress += 18;
        this.currentLoadingStep = steps[stepIndex];
        stepIndex++;
      } else if (this.creationProgress >= 100) {
        clearInterval(this.progressInterval);
      }
    }, 800);
  }

  logout() {
    this.apiService.logout();
  }

  // === EVENTOS DE UI ===

  onCreateHover(isHovering: boolean) {
    this.isHoveringCreate = isHovering;
  }

  onJoinHover(isHovering: boolean) {
    this.isHoveringJoin = isHovering;
  }

  clearCreateError() {
    this.errorMessage = '';
  }

  clearJoinError() {
    this.joinErrorMessage = '';
  }

  formatRoomCode(event: any) {
    const value = event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    this.roomCode = value.substring(0, 6);
    event.target.value = this.roomCode;
  }

  cancelCreation() {
    this.isCreatingRoom = false;
    this.creationProgress = 0;
    this.currentLoadingStep = '';
    if (this.progressInterval) clearInterval(this.progressInterval);
  }

  // === GETTERS PARA ESTILOS DINÁMICOS ===

  get heroGradientStyle() {
    const x = (this.mousePosition.x / window.innerWidth) * 100;
    const y = (this.mousePosition.y / window.innerHeight) * 100;
    
    return {
      background: `radial-gradient(circle at ${x}% ${y}%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)`
    };
  }

  get createCardTransform() {
    if (!this.isHoveringCreate) return 'scale(1) rotateY(0deg)';
    return 'scale(1.02) rotateY(-2deg)';
  }

  get joinCardTransform() {
    if (!this.isHoveringJoin) return 'scale(1) rotateY(0deg)';
    return 'scale(1.02) rotateY(2deg)';
  }
}