<?php

namespace App\Service;

use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class UserService
{
    private EntityManagerInterface $entityManager;
    private UserRepository $userRepository;
    private UserPasswordHasherInterface $passwordHasher;
    private ValidatorInterface $validator;

    public function __construct(
        EntityManagerInterface $entityManager,
        UserRepository $userRepository,
        UserPasswordHasherInterface $passwordHasher,
        ValidatorInterface $validator
    ) {
        $this->entityManager = $entityManager;
        $this->userRepository = $userRepository;
        $this->passwordHasher = $passwordHasher;
        $this->validator = $validator;
    }

    /**
     * Cria um novo usuário com validação
     */
    public function createUser(array $data): array
    {
        // Verificar se usuário já existe
        if (isset($data['email'])) {
            $existingUser = $this->userRepository->findByEmail($data['email']);
            if ($existingUser) {
                return [
                    'success' => false,
                    'message' => 'Este email já está sendo usado'
                ];
            }
        }

        $user = new User();
        $this->populateUserFromArray($user, $data);

        // Hash da senha se fornecida
        if (isset($data['password'])) {
            $hashedPassword = $this->passwordHasher->hashPassword($user, $data['password']);
            $user->setPassword($hashedPassword);
        }

        $errors = $this->validator->validate($user);

        if (count($errors) > 0) {
            return [
                'success' => false,
                'errors' => $this->formatValidationErrors($errors)
            ];
        }

        $this->entityManager->persist($user);
        $this->entityManager->flush();

        return [
            'success' => true,
            'user' => $user
        ];
    }

    /**
     * Atualiza um usuário existente
     */
    public function updateUser(User $user, array $data): array
    {
        // Se está mudando o email, verificar se não está em uso
        if (isset($data['email']) && $data['email'] !== $user->getEmail()) {
            $existingUser = $this->userRepository->findByEmail($data['email']);
            if ($existingUser && $existingUser->getId() !== $user->getId()) {
                return [
                    'success' => false,
                    'message' => 'Este email já está sendo usado'
                ];
            }
        }

        $this->populateUserFromArray($user, $data);

        // Hash da nova senha se fornecida
        if (isset($data['password']) && !empty($data['password'])) {
            $hashedPassword = $this->passwordHasher->hashPassword($user, $data['password']);
            $user->setPassword($hashedPassword);
        }

        $errors = $this->validator->validate($user);

        if (count($errors) > 0) {
            return [
                'success' => false,
                'errors' => $this->formatValidationErrors($errors)
            ];
        }

        $this->entityManager->flush();

        return [
            'success' => true,
            'user' => $user
        ];
    }

    /**
     * Valida credenciais de login
     */
    public function validateLogin(string $email, string $password): array
    {
        $user = $this->userRepository->findByEmail($email);
        
        if (!$user) {
            return [
                'success' => false,
                'message' => 'Credenciais inválidas'
            ];
        }

        if (!$this->passwordHasher->isPasswordValid($user, $password)) {
            return [
                'success' => false,
                'message' => 'Credenciais inválidas'
            ];
        }

        return [
            'success' => true,
            'user' => $user
        ];
    }

    /**
     * Busca usuário por email
     */
    public function findUserByEmail(string $email): ?User
    {
        return $this->userRepository->findByEmail($email);
    }

    /**
     * Busca usuário por ID
     */
    public function findUserById(int $id): ?User
    {
        return $this->userRepository->find($id);
    }

    /**
     * Remove um usuário
     */
    public function deleteUser(User $user): void
    {
        $this->entityManager->remove($user);
        $this->entityManager->flush();
    }

    /**
     * Verifica se o email está disponível
     */
    public function isEmailAvailable(string $email, ?User $excludeUser = null): bool
    {
        $user = $this->userRepository->findByEmail($email);
        
        if (!$user) {
            return true;
        }

        // Se estiver excluindo um usuário específico (para updates)
        if ($excludeUser && $user->getId() === $excludeUser->getId()) {
            return true;
        }

        return false;
    }

    /**
     * Obtém estatísticas do usuário
     */
    public function getUserStatistics(User $user): array
    {
        $totalTasks = count($user->getTasks());
        $completedTasks = count($user->getTasks()->filter(fn($task) => $task->isCompleted()));
        $pendingTasks = $totalTasks - $completedTasks;

        return [
            'total_tasks' => $totalTasks,
            'completed_tasks' => $completedTasks,
            'pending_tasks' => $pendingTasks,
            'member_since' => $user->getCreatedAt()->format('Y-m-d'),
            'last_update' => $user->getUpdatedAt()->format('Y-m-d H:i:s')
        ];
    }

    /**
     * Valida força da senha
     */
    public function validatePasswordStrength(string $password): array
    {
        $errors = [];

        if (strlen($password) < 8) {
            $errors[] = 'A senha deve ter pelo menos 8 caracteres';
        }

        if (!preg_match('/[A-Z]/', $password)) {
            $errors[] = 'A senha deve conter pelo menos uma letra maiúscula';
        }

        if (!preg_match('/[a-z]/', $password)) {
            $errors[] = 'A senha deve conter pelo menos uma letra minúscula';
        }

        if (!preg_match('/\d/', $password)) {
            $errors[] = 'A senha deve conter pelo menos um número';
        }

        return [
            'valid' => empty($errors),
            'errors' => $errors
        ];
    }

    /**
     * Popula usuário com dados do array
     */
    private function populateUserFromArray(User $user, array $data): void
    {
        if (isset($data['email'])) {
            $user->setEmail($data['email']);
        }

        if (isset($data['name'])) {
            $user->setName($data['name']);
        }

        if (isset($data['roles'])) {
            $user->setRoles($data['roles']);
        }
    }

    /**
     * Formata erros de validação
     */
    private function formatValidationErrors($errors): array
    {
        $formattedErrors = [];

        foreach ($errors as $error) {
            $formattedErrors[] = [
                'field' => $error->getPropertyPath(),
                'message' => $error->getMessage()
            ];
        }

        return $formattedErrors;
    }
}