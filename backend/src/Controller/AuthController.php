<?php

namespace App\Controller;

use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Core\Exception\BadCredentialsException;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/auth', name: 'api_auth_')]
class AuthController extends AbstractController
{
    private EntityManagerInterface $entityManager;
    private UserPasswordHasherInterface $passwordHasher;
    private ValidatorInterface $validator;
    private JWTTokenManagerInterface $jwtManager;
    private UserRepository $userRepository;

    public function __construct(
        EntityManagerInterface $entityManager,
        UserPasswordHasherInterface $passwordHasher,
        ValidatorInterface $validator,
        JWTTokenManagerInterface $jwtManager,
        UserRepository $userRepository
    ) {
        $this->entityManager = $entityManager;
        $this->passwordHasher = $passwordHasher;
        $this->validator = $validator;
        $this->jwtManager = $jwtManager;
        $this->userRepository = $userRepository;
    }

    #[Route('/register', name: 'register', methods: ['POST'])]
    public function register(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!$data) {
            return $this->json([
                'success' => false,
                'message' => 'Dados inválidos'
            ], Response::HTTP_BAD_REQUEST);
        }

        // Validar dados obrigatórios
        if (!isset($data['email']) || !isset($data['password']) || !isset($data['name'])) {
            return $this->json([
                'success' => false,
                'message' => 'Email, senha e nome são obrigatórios'
            ], Response::HTTP_BAD_REQUEST);
        }

        // Verificar se usuário já existe
        $existingUser = $this->userRepository->findByEmail($data['email']);
        if ($existingUser) {
            return $this->json([
                'success' => false,
                'message' => 'Este email já está sendo usado'
            ], Response::HTTP_CONFLICT);
        }

        // Criar novo usuário
        $user = new User();
        $user->setEmail($data['email']);
        $user->setName($data['name']);
        
        // Hash da senha
        $hashedPassword = $this->passwordHasher->hashPassword($user, $data['password']);
        $user->setPassword($hashedPassword);

        // Validar
        $errors = $this->validator->validate($user);
        if (count($errors) > 0) {
            $formattedErrors = [];
            foreach ($errors as $error) {
                $formattedErrors[] = [
                    'field' => $error->getPropertyPath(),
                    'message' => $error->getMessage()
                ];
            }

            return $this->json([
                'success' => false,
                'errors' => $formattedErrors
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        // Salvar usuário
        $this->entityManager->persist($user);
        $this->entityManager->flush();

        // Gerar token
        $token = $this->jwtManager->create($user);

        return $this->json([
            'success' => true,
            'message' => 'Usuário criado com sucesso',
            'data' => [
                'user' => $user,
                'token' => $token
            ]
        ], Response::HTTP_CREATED, [], ['groups' => ['user:read']]);
    }

    #[Route('/login', name: 'login', methods: ['POST'])]
    public function login(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!$data || !isset($data['email']) || !isset($data['password'])) {
            return $this->json([
                'success' => false,
                'message' => 'Email e senha são obrigatórios'
            ], Response::HTTP_BAD_REQUEST);
        }

        // Buscar usuário
        $user = $this->userRepository->findByEmail($data['email']);
        if (!$user) {
            return $this->json([
                'success' => false,
                'message' => 'Credenciais inválidas'
            ], Response::HTTP_UNAUTHORIZED);
        }

        // Verificar senha
        if (!$this->passwordHasher->isPasswordValid($user, $data['password'])) {
            return $this->json([
                'success' => false,
                'message' => 'Credenciais inválidas'
            ], Response::HTTP_UNAUTHORIZED);
        }

        // Gerar token
        $token = $this->jwtManager->create($user);

        return $this->json([
            'success' => true,
            'message' => 'Login realizado com sucesso',
            'data' => [
                'user' => $user,
                'token' => $token
            ]
        ], Response::HTTP_OK, [], ['groups' => ['user:read']]);
    }

    #[Route('/me', name: 'me', methods: ['GET'])]
    public function getCurrentUser(): JsonResponse
    {
        $user = $this->getUser();

        if (!$user) {
            return $this->json([
                'success' => false,
                'message' => 'Usuário não autenticado'
            ], Response::HTTP_UNAUTHORIZED);
        }

        return $this->json([
            'success' => true,
            'data' => $user
        ], Response::HTTP_OK, [], ['groups' => ['user:read']]);
    }

    #[Route('/refresh', name: 'refresh', methods: ['POST'])]
    public function refresh(): JsonResponse
    {
        $user = $this->getUser();

        if (!$user) {
            return $this->json([
                'success' => false,
                'message' => 'Usuário não autenticado'
            ], Response::HTTP_UNAUTHORIZED);
        }

        // Gerar novo token
        $token = $this->jwtManager->create($user);

        return $this->json([
            'success' => true,
            'data' => [
                'token' => $token
            ]
        ], Response::HTTP_OK);
    }
}